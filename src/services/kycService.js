import api from "./api";

const kycService = {
  getStatus: () => api.get("/kyc/status"),
  getKycDetails: (id) => api.get(`/kyc/${id}`),

  submitPersonalKyc: (data) => api.post("/kyc/personal", data),
  resubmitPersonalKyc: (data) => api.put("/kyc/resubmit", data),
  submitCompanyKyc: (data) => api.post("/kyc/company", data),
  submitInvestmentKyc: (data) => api.post("/kyc/investment", data),

  // --- DigiLocker automatic verification (post-account authenticated flow) ---
  // Returns { redirectUrl } — send the browser there to start the DigiLocker OAuth flow.
  initiateDigiLocker: () => api.get("/kyc/digilocker/authorize"),
  // Poll this while waiting for the DigiLocker callback to finish processing.
  getDigiLockerStatus: () => api.get("/kyc/digilocker/status"),
  // Switch back to manual upload after a DigiLocker failure.
  digilockerFallback: () => api.post("/kyc/digilocker/fallback"),

  /* === PRE-ACCOUNT DIGILOCKER INITIATION (Commented out — uncomment when mandatory pre-account KYC is enabled) ===
  initiateDigiLockerForSignup: (signupSessionId) =>
    api.get("/kyc/digilocker/authorize", { params: { signupSessionId } }),
  ================================================================================================================= */
};

export default kycService;
