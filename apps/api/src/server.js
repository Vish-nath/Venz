import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';

const app = express();
const PORT = process.env.PORT || 8000;
const webDist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../web/dist');
const speciesIndexPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../data/processed/venomous-snakes/species-index.json');
app.use(helmet({
  // Google Identity Services uses a popup and must be able to message its opener.
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      'script-src': ["'self'", "'unsafe-inline'", 'https://accounts.google.com'],
      'frame-src': ["'self'", 'https://accounts.google.com'],
      'connect-src': ["'self'", 'https://accounts.google.com', 'https://oauth2.googleapis.com'],
      'img-src': ["'self'", 'data:', 'blob:', 'https://*.googleusercontent.com'],
      'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      'font-src': ["'self'", 'https://fonts.gstatic.com', 'data:'],
    },
  },
}));
app.use(express.json({ limit: '11mb' }));
app.use(morgan('tiny'));

app.get('/api/health', (_req, res) => res.json({ status: 'ok', message: 'Venz API is available' }));
const euCountries = new Set(['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE','IT','LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE']);
const emergencyFor = (code, country) => {
  if (code === 'IN') return { country, code, numbers: ['112'], source: 'Government of India ERSS' };
  if (code === 'US' || code === 'CA') return { country, code, numbers: ['911'], source: 'National emergency service' };
  if (euCountries.has(code)) return { country, code, numbers: ['112'], source: 'European Union emergency number' };
  if (code === 'GB') return { country, code, numbers: ['999','112'], source: 'UK national emergency numbers' };
  return { country, code, numbers: [], source: null };
};
const reverseCache = new Map();
let lastReverseRequest = 0;
let reverseQueue = Promise.resolve();
app.get('/api/location/emergency-contact', async (req, res) => {
  const lat=Number(req.query.lat), lon=Number(req.query.lon);
  if (!Number.isFinite(lat)||!Number.isFinite(lon)||lat < -90||lat > 90||lon < -180||lon > 180) return res.status(400).json({message:'Valid latitude and longitude are required.'});
  const key=`${lat.toFixed(2)},${lon.toFixed(2)}`;
  if(reverseCache.has(key)) return res.json(reverseCache.get(key));
  try {
    const slot=reverseQueue.then(async()=>{
      const delay=Math.max(0,1000-(Date.now()-lastReverseRequest));
      if(delay) await new Promise(resolve=>setTimeout(resolve,delay));
      lastReverseRequest=Date.now();
    });
    reverseQueue=slot.catch(()=>{});await slot;
    const url=new URL('https://nominatim.openstreetmap.org/reverse');
    url.search=new URLSearchParams({format:'jsonv2',lat:String(lat),lon:String(lon),zoom:'3',addressdetails:'1'}).toString();
    const response=await fetch(url,{headers:{'User-Agent':'VenzSnakeSafety/1.0 (https://venz-1y7c.onrender.com)'},signal:AbortSignal.timeout(8000)});
    if(!response.ok) throw new Error('Geocoder unavailable');
    const data=await response.json();
    const address=data.address||{};const code=String(address.country_code||'').toUpperCase();
    if(!code||!address.country) throw new Error('Country was not returned');
    const result=emergencyFor(code,address.country);
    reverseCache.set(key,result);
    if(reverseCache.size>500) reverseCache.delete(reverseCache.keys().next().value);
    return res.json(result);
  } catch { return res.status(503).json({message:'Could not determine your country. Enter your local emergency number from an official local source.'}); }
});
app.get('/api/species', async (_req, res) => {
  try {
    const index = JSON.parse(await readFile(speciesIndexPath, 'utf8'));
    res.json({ source: 'venomous-snakes.csv', count: index.count, species: index.species });
  } catch {
    res.status(503).json({ message: 'Species catalogue is not included in this deployment. Add data/raw/venomous-snakes/venomous-snakes.csv to the deployment repository.' });
  }
});
const googleClientId = () => process.env.VITE_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
app.get('/api/auth/status', (_req, res) => res.json({
  api: 'ok',
  googleClientConfigured: Boolean(googleClientId()),
  message: googleClientId() ? 'Google OAuth verification is configured.' : 'Set VITE_GOOGLE_CLIENT_ID on the Render service.'
}));
app.post('/api/auth/google', async (req, res) => {
  const clientId = googleClientId();
  const credential = req.body?.credential;
  if (!clientId) return res.status(503).json({ message: 'Google sign-in is not configured. Set VITE_GOOGLE_CLIENT_ID in Render and redeploy.' });
  if (typeof credential !== 'string' || credential.length > 12000) return res.status(400).json({ message: 'Missing or invalid Google credential.' });
  try {
    const verify = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
    if (!verify.ok) return res.status(401).json({ message: 'Google could not verify this sign-in. Please try again.' });
    const claims = await verify.json();
    if (claims.aud !== clientId) return res.status(401).json({ message: 'OAuth client ID mismatch. Confirm VITE_GOOGLE_CLIENT_ID is the Google OAuth Web client ID authorized for this site.' });
    if (!(claims.email_verified === true || claims.email_verified === 'true') || !claims.sub || !claims.email) return res.status(401).json({ message: 'Google token is valid, but the account email is not verified.' });
    return res.json({ id: claims.sub, email: claims.email, name: claims.name || claims.given_name || 'Venz user', picture: claims.picture || null });
  } catch { return res.status(502).json({ message: 'Could not contact Google to verify sign-in.' }); }
});
app.post('/api/triage', async (req, res) => {
  const { mode, location, image, imageName } = req.body || {};
  if (!['bite', 'sighting'].includes(mode)) return res.status(400).json({ message: 'Choose bite or sighting mode.' });
  if (!location?.trim()) return res.status(400).json({ message: 'Enter a town or allow location access to provide regional context.' });
  if (image && (typeof image !== 'string' || !/^data:image\/(jpeg|png|webp);base64,/.test(image) || image.length > 11_200_000)) return res.status(400).json({ message: 'Unsupported or oversized image.' });
  let match = null;
  if (image && typeof imageName === 'string' && imageName.length <= 255) {
    try {
      const index = JSON.parse(await readFile(speciesIndexPath, 'utf8'));
      const key = path.basename(imageName).replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const commonName = index.imageLabels[key];
      if (commonName) match = index.species.find(item => item['Common Name'] === commonName) || null;
    } catch { /* Dataset index is optional; return the safe fallback below. */ }
  }
  // Filename matching only works when the uploaded image retains its original dataset filename.
  return res.json({
    identification: match ? match['Common Name'] : image ? 'Identification unavailable' : 'No image supplied',
    speciesDetails: match,
    identificationMethod: match ? 'dataset-filename-match' : null,
    urgency: mode === 'bite' ? 'URGENT · MEDICAL CARE' : 'KEEP DISTANCE',
    message: mode === 'bite' ? 'A photo cannot determine whether venom was injected. Contact emergency services or a poison center now, even if symptoms seem mild.' : 'This service does not yet have a validated image classifier or regional species dataset. Do not approach the animal; contact local wildlife or emergency services if it poses a risk.',
    precautions: mode === 'bite' ? ['Keep the person still and calm; immobilize the affected limb.', 'Remove rings, watches, or tight clothing near swelling.', 'Do not cut, suck, ice, or apply a tourniquet. Do not try to catch the snake.', 'Take a photo only from a safe distance and seek emergency care immediately.'] : ['Move people and pets away; do not touch, corner, or kill the snake.', 'Keep a safe distance and note where it went only if safe.', 'Contact local wildlife control if it is near people or inside a building.'],
    confidence: null,
    notice: match ? 'Matched the original dataset filename. This does not analyze the image pixels and is not a verified identification.' : 'Educational safety guidance only. No image classifier is configured; renamed and camera images cannot be identified.'
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
