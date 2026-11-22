import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const PORT = process.env.PORT || 8000;
const webDist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../web/dist');
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173').split(',').map(x => x.trim());
app.use(helmet());
app.use(cors({ origin: (origin, cb) => !origin || allowedOrigins.includes(origin) ? cb(null, true) : cb(new Error('Origin not allowed')), methods: ['GET', 'POST'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json({ limit: '11mb' }));
app.use(morgan('tiny'));

app.get('/api/health', (_req, res) => res.json({ status: 'ok', message: 'Venz API is available' }));
app.post('/api/triage', (req, res) => {
  const { mode, location, image } = req.body || {};
  if (!['bite', 'sighting'].includes(mode)) return res.status(400).json({ message: 'Choose bite or sighting mode.' });
  if (!location?.trim()) return res.status(400).json({ message: 'Enter a town or allow location access to provide regional context.' });
  if (image && (typeof image !== 'string' || !/^data:image\/(jpeg|png|webp);base64,/.test(image) || image.length > 11_200_000)) return res.status(400).json({ message: 'Unsupported or oversized image.' });
  // Dataset/model inference is intentionally not fabricated. The app provides safe guidance until a validated model is configured.
  return res.json({
    identification: image ? 'Identification unavailable' : 'No image supplied',
    urgency: mode === 'bite' ? 'URGENT · MEDICAL CARE' : 'KEEP DISTANCE',
    message: mode === 'bite' ? 'A photo cannot determine whether venom was injected. Contact emergency services or a poison center now, even if symptoms seem mild.' : 'This service does not yet have a validated image classifier or regional species dataset. Do not approach the animal; contact local wildlife or emergency services if it poses a risk.',
    precautions: mode === 'bite' ? ['Keep the person still and calm; immobilize the affected limb.', 'Remove rings, watches, or tight clothing near swelling.', 'Do not cut, suck, ice, or apply a tourniquet. Do not try to catch the snake.', 'Take a photo only from a safe distance and seek emergency care immediately.'] : ['Move people and pets away; do not touch, corner, or kill the snake.', 'Keep a safe distance and note where it went only if safe.', 'Contact local wildlife control if it is near people or inside a building.'],
    confidence: null,
    notice: 'Educational safety guidance only. No diagnosis or species identification was performed.'
  });
});
// In the single-service Render deployment, Express also serves the compiled web client.
app.use(express.static(webDist));
app.get('*', (_req, res, next) => res.sendFile(path.join(webDist, 'index.html'), err => err && next()));
app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  res.status(status).json({ message: status === 413 ? 'Request is too large.' : status === 400 ? 'Invalid request.' : 'Service error.' });
});
app.listen(PORT, () => console.log(`Venz API listening on ${PORT}`));
