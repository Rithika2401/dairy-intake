const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

dotenv.config();

const { extractDocumentData } = require('./services/geminiService');
const { validateDocumentRules } = require('./services/validationEngine');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'dairy-intake-secret-key-2026';

app.use(cors());
app.use(express.json());

// In-Memory Database Store (with Seed Records)
let casesStore = [
  {
    id: 'CASE-2026-8801',
    title: 'Morning Milk Collection Slip #CS-991',
    documentType: 'Collection Slip',
    farmerId: 'F-4091',
    farmerName: 'Ramesh Patel',
    centre: 'Anand Main Chilling Hub',
    uploadDate: '2026-08-08 07:45:10',
    status: 'Approved',
    riskLevel: 'Low',
    confidenceScore: 0.96,
    assignedReviewer: 'Dr. Ananya Roy',
    extractedData: {
      slipNumber: 'CS-991',
      milkVolumeLiters: 1250.5,
      fatPercentage: 4.2,
      snfPercentage: 8.8,
      temperatureC: 3.4,
    },
  },
  {
    id: 'CASE-2026-8802',
    title: 'Lab Microbial Quality Test #LT-4402',
    documentType: 'Test Report',
    farmerId: 'F-5104',
    farmerName: 'Vikram Singh',
    centre: 'Vadodara Intake Terminal',
    uploadDate: '2026-08-08 08:30:00',
    status: 'Exception Flagged',
    riskLevel: 'High',
    confidenceScore: 0.72,
    assignedReviewer: 'Dr. Ananya Roy',
    extractedData: {
      reportNumber: 'LT-4402',
      fatPercentage: 3.1,
      snfPercentage: 8.2,
      bacterialCountCFU: 185000,
      temperatureC: 4.8,
    },
  },
];

let auditLogsStore = [
  {
    id: 'AUD-9901',
    timestamp: '2026-08-08 10:45:00',
    actor: 'Sanjay Mehta',
    role: 'Supervisor',
    action: 'CASE_ASSIGNMENT',
    entity: 'CASE-2026-8803',
    details: 'Assigned Tanker Log TL-551 review case to self.',
    outcome: 'Success',
    ipAddress: '192.168.1.45',
  },
];

// Helper Audit Logger
function logAudit(actor, role, action, entity, details, outcome = 'Success') {
  auditLogsStore.unshift({
    id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    actor,
    role,
    action,
    entity,
    details,
    outcome,
    ipAddress: '192.168.1.10',
  });
}

// REST API Endpoints

// 1. Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'HEALTHY', timestamp: new Date().toISOString(), service: 'Dairy Intake Hub API' });
});

// 2. Authentication Route
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email address is required' });
  }

  const role = email.includes('admin')
    ? 'Compliance Admin'
    : email.includes('supervisor')
    ? 'Supervisor'
    : email.includes('reviewer')
    ? 'Reviewer'
    : 'Applicant';

  const user = {
    id: `usr-${Date.now()}`,
    email,
    name: email.split('@')[0].toUpperCase(),
    role,
    department: 'Dairy Operations',
    centre: 'Anand Main Chilling Hub',
  };

  const token = jwt.sign(user, JWT_SECRET, { expiresIn: '14d' });
  logAudit(user.name, user.role, 'LOGIN', user.id, 'User authenticated via JWT.');
  res.json({ token, user });
});

// 3. Document Extraction Endpoint (Gemini AI Vision API)
app.post('/api/extraction/process', async (req, res) => {
  try {
    const { category } = req.body;
    const extracted = await extractDocumentData(Buffer.from('sample'), 'image/png', category || 'Collection Slip');
    const validation = validateDocumentRules(extracted.extractedFields, category);

    res.json({
      success: true,
      extracted,
      validation,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Cases API Endpoints
app.get('/api/cases', (req, res) => {
  res.json(casesStore);
});

app.post('/api/cases', (req, res) => {
  const newCase = {
    id: `CASE-2026-${Math.floor(8800 + Math.random() * 1000)}`,
    title: req.body.title || 'New Document Intake',
    documentType: req.body.documentType || 'Collection Slip',
    farmerName: req.body.farmerName || 'Ramesh Patel',
    centre: req.body.centre || 'Anand Main Chilling Hub',
    uploadDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
    status: req.body.status || 'Pending Intake',
    confidenceScore: req.body.confidenceScore || 0.92,
    extractedData: req.body.extractedData || {},
  };

  casesStore.unshift(newCase);
  logAudit(req.body.actor || 'User', 'Applicant', 'DOCUMENT_UPLOAD', newCase.id, `Uploaded ${newCase.title}.`);
  res.status(201).json(newCase);
});

// 5. Audit Logs API
app.get('/api/audit', (req, res) => {
  res.json(auditLogsStore);
});

// Serve Vite Static Build files if in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Dairy Intelligent Intake Hub Backend listening on port ${PORT}`);
});
