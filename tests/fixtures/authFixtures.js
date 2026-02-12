/**
 * Authentication test fixtures
 */

export const mockLoginRequest = {
  email: 'admin@rakez.com',
  password: 'password123'
}

export const mockLoginResponse = {
  success: true,
  message: 'Login successful',
  data: {
    user: {
      id: 1,
      name: 'Ahmed Mohammed Al-Rashid',
      email: 'admin@rakez.com',
      type: 'admin',
      phone: '+966501234567',
      created_at: '2026-01-15T10:00:00.000000Z'
    },
    token: '1|abcdefghijklmnopqrstuvwxyz1234567890ABCDEFG',
    access_token: '1|abcdefghijklmnopqrstuvwxyz1234567890ABCDEFG'
  }
}

export const mockLoginErrorResponse = {
  success: false,
  message: 'Invalid credentials'
}

export const mockUser = {
  id: 1,
  name: 'Ahmed Mohammed Al-Rashid',
  email: 'admin@rakez.com',
  type: 1,
  phone: '+966501234567',
  created_at: '2026-01-15T10:00:00.000000Z'
}

export const mockLogoutResponse = {
  success: true,
  message: 'Logged out successfully'
}
