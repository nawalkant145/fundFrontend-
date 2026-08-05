import api from "./api";

export const kycService = {
  getStatus: () => api.get("/kyc/status"),
  submitPersonalKyc: (data) => api.post("/kyc/personal", data),
  submitCompanyKyc: (data) => api.post("/kyc/company", data),
  submitInvestmentKyc: (data) => api.post("/kyc/investment", data),
};

export default kycService;
