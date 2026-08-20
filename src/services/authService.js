import api from "./api";

export const authService = {
  /* === PRE-ACCOUNT SIGNUP INITIATION (Commented out — uncomment when mandatory pre-account KYC is enabled) ===
  initiateSignup: (data) => api.post("/auth/signup/initiate", data),
  ============================================================================================================= */

  register: (data) => api.post("/auth/register", data),


  login: (data) => api.post("/auth/login", data),
  logout: () => api.post("/auth/logout"),
  refreshToken: () => api.post("/auth/refresh-token"),
  getMe: () => api.get("/auth/me"),

  // Live availability check (username / email / phone)
  checkAvailability: (params) =>
    api.get("/auth/check-availability", { params }),

  // Pre-register OTP (verify email before account creation)
  sendPreRegisterOtp: (email) =>
    api.post("/auth/send-pre-register-otp", { email }),
  verifyPreRegisterOtp: (email, otp) =>
    api.post("/auth/verify-pre-register-otp", { email, otp }),

  // OTP (for already logged-in users)
  sendEmailOtp: () => api.post("/auth/send-email-otp"),
  verifyEmailOtp: (otp) => api.post("/auth/verify-email-otp", { otp }),
  sendPhoneOtp: (phone) => api.post("/auth/send-phone-otp", { phone }),
  verifyPhoneOtp: (otp) => api.post("/auth/verify-phone-otp", { otp }),

  // Password
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  resetPassword: (data) => api.post("/auth/reset-password", data),
  changePassword: (data) => api.post("/auth/change-password", data),
};

