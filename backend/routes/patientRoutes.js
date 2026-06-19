const express = require('express');
const { getPatients } = require('../controllers/patientController');

const router = express.Router();

// Simple mock auth middleware for now, just checking if token exists in header
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  next();
};

router.get('/', authMiddleware, getPatients);

module.exports = router;
