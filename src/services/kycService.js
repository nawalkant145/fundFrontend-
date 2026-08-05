import api from "./api";

export const kycService = {
  getStatus: () => api.get("/kyc/status"),
  getKycDetails: (id) => api.get(`/kyc/${id}`),
  submitPersonalKyc: (data) => api.post("/kyc/personal", data),
  resubmitPersonalKyc: (data) => api.put("/kyc/resubmit", data),
  submitCompanyKyc: (data) => api.post("/kyc/company", data),
  submitInvestmentKyc: (data) => api.post("/kyc/investment", data),
};

export default kycService;
