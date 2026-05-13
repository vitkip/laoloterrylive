import { API } from '../../../utils/api';

const post = async (action, body) => {
  const res = await fetch(`${API}/auth.php?action=${action}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });
  const data = await res.json();
  return { ok: res.ok, data, status: res.status };
};

export const authService = {
  register: (body) => post('register', body),

  checkAvailability: async (field, value) => {
    const res  = await fetch(`${API}/auth.php?action=check_availability&field=${field}&value=${encodeURIComponent(value)}`);
    const data = await res.json();
    return { ok: res.ok, data };
  },

  verifyOTP: (userId, otpCode) =>
    post('verify_otp', { user_id: userId, otp_code: otpCode }),

  resendOTP: (userId) =>
    post('resend_otp', { user_id: userId }),

  forgotPassword: (email) =>
    post('forgot_password', { email }),

  resetPassword: (token, password) =>
    post('reset_password', { token, password }),

  verifyEmail: (token) =>
    post('verify_email', { token }),
};
