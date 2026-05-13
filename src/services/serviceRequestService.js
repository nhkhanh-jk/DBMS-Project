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
    // Staff/Admin can see all requests (no filter needed)

    // Get service requests
    const serviceRequests = await ServiceRequest.find(query)
      .sort({ createdAt: -1 })
      .populate('userId', 'username fullName');

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
    const updatedRequest = await ServiceRequest.findByIdAndUpdate(
      requestId,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedRequest) {
      const error = new Error('Service request not found');
      error.status = 404;
      throw error;
    }

    // Return DTO
    return this._toServiceRequestDTO(updatedRequest);
  }

  // Helper method to convert service request to DTO (matches Python's to_service_request_dto)
  _toServiceRequestDTO(serviceRequest) {
    const sr = serviceRequest.toObject ? serviceRequest.toObject() : serviceRequest;

    return {
      // English
      id: sr._id.toString(),
      userId: sr.userId.toString(),
      requestType: sr.requestType,
      requestDetail: sr.requestDetail,
      status: sr.status,
      // Vietnamese
      MaYC: sr._id.toString(),
      MaKH: sr.userId.toString(),
      LoaiYeuCau: sr.requestType,
      ChiTietYeuCau: sr.requestDetail,
      TrangThai: sr.status,
    };
  }
}

module.exports = new ServiceRequestService();
