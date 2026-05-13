const { normalize } = require('../utils/legacyNormalizer');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiresIn } = require('../config/env');

class AuthService {
  async registerCustomer(payload) {
    const normalized = normalize(payload, 'user');
    let { username, password, fullName, email, phoneNumber, dateOfBirth, gender } = normalized;
    if (!username && email) {
      username = email.split('@')[0];
    }
    if (!username && phoneNumber) {
      username = `user${phoneNumber.slice(-6)}`;
    }
    if (!username || !password || !fullName || !email || !phoneNumber) {
      const error = new Error('Missing required fields');
      error.status = 400;
      throw error;
    }
    if (password.length < 6) {
      const error = new Error('Password must be at least 6 characters');
      error.status = 400;
      throw error;
    }
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      const error = new Error('Username already exists');
      error.status = 409;
      throw error;
    }
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      const error = new Error('Email already exists');
      error.status = 409;
      throw error;
    }
    const userData = {
      username,
      password,
      role: 'KHACHHANG',
      fullName,
      email,
      phoneNumber,
      rewardPoints: 0,
      membershipLevel: 'bronze',
    };
    if (dateOfBirth) userData.dateOfBirth = new Date(dateOfBirth);
    if (gender) userData.gender = gender;
    const user = await User.create(userData);
    return this._toProfileDTO(user);
  }

  async registerEmployee(payload) {
    const normalized = normalize(payload, 'user');
    const { username, password, fullName, email, phoneNumber, role } = normalized;
    if (!username || !password || !fullName) {
      const error = new Error('Missing required fields');
      error.status = 400;
      throw error;
    }
    if (password.length < 6) {
      const error = new Error('Password must be at least 6 characters');
      error.status = 400;
      throw error;
    }
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      const error = new Error('Username already exists');
      error.status = 409;
      throw error;
    }
    let userRole = (role || 'NHANVIEN').toUpperCase();
    if (!['ADMIN', 'NHANVIEN', 'QUANLY'].includes(userRole)) {
      const error = new Error('Invalid role for employee');
      error.status = 400;
      throw error;
    }
    if (userRole === 'QUANLY') userRole = 'NHANVIEN';
    const userData = {
      username,
      password,
      role: userRole,
      fullName,
      email: email || null,
      phoneNumber: phoneNumber || null,
    };
    const user = await User.create(userData);
    return this._toProfileDTO(user);
  }

  async login(payload) {
    const normalized = normalize(payload, 'user');
    const { username, email, password } = normalized;
    const identifier = username || email;
    if (!identifier || !password) {
      const error = new Error('Missing credentials');
      error.status = 400;
      throw error;
    }
    const user = await User.findOne({
      $or: [{ username: identifier }, { email: identifier }]
    });
    if (!user) {
      const error = new Error('Invalid credentials');
      error.status = 401;
      throw error;
    }
    // Test phase: DB currently stores plain-text passwords, so compare directly.
    const isValidPassword = password === user.password;
    if (!isValidPassword) {
      const error = new Error('Invalid credentials');
      error.status = 401;
      throw error;
    }
    const accessToken = jwt.sign(
      { id: user._id, role: user.role, username: user.username },
      jwtSecret,
      { expiresIn: jwtExpiresIn }
    );
    return {
      accessToken,
      profile: this._toProfileDTO(user)
    };
  }

  async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }
    return this._toProfileDTO(user);
  }

  async updateProfile(userId, payload) {
    const normalized = normalize(payload, 'user');
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }
    const { fullName, phoneNumber, gender, dateOfBirth } = normalized;
    const updateData = {};
    if (fullName !== undefined) updateData.fullName = fullName;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (gender !== undefined) updateData.gender = gender;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = new Date(dateOfBirth);
    if (Object.keys(updateData).length === 0) {
      const error = new Error('No valid profile fields to update');
      error.status = 400;
      throw error;
    }
    await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true });
    const updatedUser = await User.findById(userId);
    return this._toProfileDTO(updatedUser);
  }

  async changePassword(userId, payload) {
    const normalized = normalize(payload, 'user');
    const { currentPassword, newPassword } = normalized;
    if (!currentPassword || !newPassword) {
      const error = new Error('Missing password fields');
      error.status = 400;
      throw error;
    }
    if (newPassword.length < 6) {
      const error = new Error('New password must be at least 6 characters');
      error.status = 400;
      throw error;
    }
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }
    const isValidPassword = currentPassword === user.password;
    if (!isValidPassword) {
      const error = new Error('Current password is incorrect');
      error.status = 400;
      throw error;
    }
    const isSamePassword = newPassword === user.password;
    if (isSamePassword) {
      const error = new Error('New password must be different from current password');
      error.status = 400;
      throw error;
    }
    await User.findByIdAndUpdate(userId, { password: newPassword });
    return { message: 'Password updated successfully' };
  }

  _toProfileDTO(user) {
    const userObj = user.toObject ? user.toObject() : user;
    const role = (userObj.role || '').toUpperCase();
    const baseProfile = {
      userId: userObj._id.toString(),
      username: userObj.username,
      role: userObj.role,
      fullName: userObj.fullName,
      dateOfBirth: userObj.dateOfBirth,
      gender: userObj.gender,
      email: userObj.email,
      phoneNumber: userObj.phoneNumber,
      rewardPoints: userObj.rewardPoints || 0,
      membershipLevel: userObj.membershipLevel || 'bronze',
      VaiTro: role,
    };
    if (role === 'KHACHHANG') {
      baseProfile.customer = {
        fullName: userObj.fullName,
        email: userObj.email,
        phone: userObj.phoneNumber,
        loyaltyPoints: userObj.rewardPoints || 0,
        memberTier: userObj.membershipLevel || 'bronze',
      };
    } else {
      baseProfile.employee = {
        fullName: userObj.fullName,
        email: userObj.email,
        phone: userObj.phoneNumber,
        position: userObj.role,
      };
    }
    return baseProfile;
  }
}

module.exports = new AuthService();
