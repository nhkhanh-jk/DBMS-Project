const { normalize } = require('../utils/legacyNormalizer');
const ServiceRequest = require('../models/ServiceRequest');
const User = require('../models/User');

class ServiceRequestService {
  async createServiceRequest(payload, currentUser) {
    // Normalize the payload (convert VI keys to EN keys)
    const normalized = normalize(payload, 'serviceRequest');

    // Extract fields
    const { requestType, requestDetail } = normalized;

    // Validate required fields
    if (!requestType || !requestDetail) {
      const error = new Error('Missing required fields');
      error.status = 400;
      throw error;
    }

    // Create service request document
    const serviceRequestData = {
      userId: currentUser.id,
      requestType,
      requestDetail,
      status: 'PENDING',
    };

    // Create service request
    const serviceRequest = await ServiceRequest.create(serviceRequestData);

    // Return DTO
    return this._toServiceRequestDTO(serviceRequest);
  }

  async getServiceRequests(currentUser) {
    // Build query based on user role
    let query = {};
    if (currentUser.role === 'KHACHHANG') {
      // Customers can only see their own requests
      query.userId = currentUser.id;
    }

    // Get service requests
    const serviceRequests = await ServiceRequest.findAll({
      where: query,
      order: [['createdAt', 'DESC']]
    });

    // Convert to DTOs
    return serviceRequests.map(request => this._toServiceRequestDTO(request));
  }

  async updateServiceRequestStatus(requestId, status) {
    // Validate status
    const validStatuses = ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      const error = new Error('Invalid status');
      error.status = 400;
      throw error;
    }

    // Update service request
    const serviceRequest = await ServiceRequest.findByPk(requestId);
    if (!serviceRequest) {
      const error = new Error('Service request not found');
      error.status = 404;
      throw error;
    }

    await serviceRequest.update({ status });

    // Return DTO
    return this._toServiceRequestDTO(serviceRequest);
  }

  // Helper method to convert service request to DTO
  _toServiceRequestDTO(serviceRequest) {
    const sr = serviceRequest.get ? serviceRequest.get({ plain: true }) : serviceRequest;

    const idStr = sr.id.toString();
    const userIdStr = sr.userId.toString();

    return {
      // English
      id: idStr,
      userId: userIdStr,
      requestType: sr.requestType,
      requestDetail: sr.requestDetail,
      status: sr.status,
      // Vietnamese
      MaYC: idStr,
      MaKH: userIdStr,
      LoaiYeuCau: sr.requestType,
      ChiTietYeuCau: sr.requestDetail,
      TrangThai: sr.status,
    };
  }
}

module.exports = new ServiceRequestService();
