const express = require('express');
const router = express.Router();
const serviceRequestService = require('../services/serviceRequestService');
const { requireAuth, requireRole } = require('../middleware/auth');

// POST /api/service-requests
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const result = await serviceRequestService.createServiceRequest(req.body, req.user);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/service-requests
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const result = await serviceRequestService.getServiceRequests(req.user);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/service-requests/:id/status
router.patch('/:id/status', requireAuth, requireRole('ADMIN', 'NHANVIEN'), async (req, res, next) => {
  try {
    const result = await serviceRequestService.updateServiceRequestStatus(req.params.id, req.body.status);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
