/**
 * ml.js — Route proxy sang Python ML service
 *
 * Endpoints:
 *   POST /api/ml/predict     — dự đoán số vé bán
 *   GET  /api/ml/analytics   — thống kê tổng quan
 *   GET  /api/ml/health      — kiểm tra ML service
 *   GET  /api/ml/feature-importance — độ quan trọng features
 */

const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

/**
 * Generic proxy helper — gọi Python ML service
 */
async function proxyML(path, method = 'GET', body = null) {
  const url = `${ML_SERVICE_URL}${path}`;
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(url, options);
  const data = await res.json();
  if (!res.ok) throw Object.assign(new Error(data.detail || 'ML service error'), { status: res.status });
  return data;
}

// ─── GET /api/ml/health ───────────────────────────────────────────────────────
router.get('/health', async (req, res, next) => {
  try {
    const data = await proxyML('/health');
    res.json(data);
  } catch (error) {
    res.status(503).json({
      status: 'unavailable',
      message: 'ML service chưa khởi động. Chạy: cd ml && python api.py',
    });
  }
});

// ─── POST /api/ml/predict ─────────────────────────────────────────────────────
// Public route — bất kỳ ai cũng có thể xem dự đoán (cho UI admin/staff)
router.post('/predict', requireAuth, requireRole('ADMIN', 'NHANVIEN'), async (req, res, next) => {
  try {
    const {
      start_time,
      base_price,
      duration_min,
      genres,
      avg_rating,
      review_count,
    } = req.body;

    if (!start_time || !base_price || !duration_min) {
      return res.status(400).json({
        error: 'Thiếu thông tin: start_time, base_price, duration_min là bắt buộc',
      });
    }

    const data = await proxyML('/predict', 'POST', {
      start_time,
      base_price,
      duration_min,
      genres: genres || [],
      avg_rating: avg_rating || 0,
      review_count: review_count || 0,
    });

    res.json(data);
  } catch (error) {
    next(error);
  }
});

// ─── GET /api/ml/analytics ───────────────────────────────────────────────────
router.get('/analytics', requireAuth, requireRole('ADMIN', 'NHANVIEN'), async (req, res, next) => {
  try {
    const data = await proxyML('/analytics');
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// ─── GET /api/ml/feature-importance ─────────────────────────────────────────
router.get('/feature-importance', requireAuth, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const data = await proxyML('/feature-importance');
    res.json(data);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
