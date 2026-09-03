import api from "./api";

const kycService = {
  getStatus: () => api.get("/kyc/status"),
  getKycDetails: (id) => api.get(`/kyc/${id}`),

  submitPersonalKyc: (data) => api.post("/kyc/personal", data),
  resubmitPersonalKyc: (data) => api.put("/kyc/resubmit", data),
  submitCompanyKyc: (data) => api.post("/kyc/company", data),
  submitInvestmentKyc: (data) => api.post("/kyc/investment", data),

                                                                                
                                                                                         
  initiateDigiLocker: () => api.get("/kyc/digilocker/authorize"),
                                                                              
  getDigiLockerStatus: () => api.get("/kyc/digilocker/status"),
                                                             
  digilockerFallback: () => api.post("/kyc/digilocker/fallback"),

                                                                      
                                                                      
                                                                    
                                                                                       
  initiateDigiLockerForSignup: (signupSessionId) =>
    api.get("/kyc/digilocker/authorize", { params: { signupSessionId } }),
};

export default kycService;

