const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/env');
const User = require('../models/User');

const roles = { ADMIN: 'ADMIN', NHANVIEN: 'NHANVIEN', KHACHHANG: 'KHACHHANG' };

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access token required', code: 401 });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = { id: decoded.id, role: decoded.role, username: decoded.username };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token', code: 401 });
  }
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Access token required', code: 401 });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden', code: 403 });
    }

    next();
  };
}

module.exports = { requireAuth, requireRole };
