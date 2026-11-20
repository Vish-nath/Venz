import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';

const app = express();
const PORT = process.env.PORT || 8000;

// ==========================================
// 🛡️ SECURITY & MIDDLEWARE
// ==========================================
// Helmet secures Express apps by setting HTTP response headers.
app.use(helmet());

// CORS configuration - to be tightened for production
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse incoming JSON payloads (with strict size limits to prevent DOS)
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev')); // HTTP request logger

// ==========================================
// 🚀 ROUTES
// ==========================================

// Health Check (Good for testing tunnels & Render deployment)
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'secure', message: 'Triage API is running safely.' });
});

// Mock Triage Endpoint
app.post('/api/triage', (req, res) => {
    const { bloodType, symptoms, geoRegion } = req.body;

    // TODO: Implement actual database matching, input sanitization, and DB querying
    console.log(`[Triage Request] Blood: ${bloodType}, Symptoms: ${symptoms}, Region: ${geoRegion}`);

    res.status(200).json({
        urgency: 'HIGH',
        message: 'Mock Response: Seek medical attention immediately.',
        precautions: ['Keep the bitten area still', 'Do not apply ice']
    });
});

// ==========================================
// 🚨 ERROR HANDLING
// ==========================================
app.use((err, req, res, next) => {
    console.error(`[Error] ${err.message}`);
    res.status(err.status || 500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

app.listen(PORT, () => {
    console.log(`🔒 Secure Backend listening on http://localhost:${PORT}`);
});
