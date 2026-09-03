import api from "./api";

export const deckAccessService = {
                                                       
  request: (founderId, message) =>
    api.post("/pitch-deck-access/request", { founderId, message }),
                                      
  respond: (id, approve) =>
    api.put(`/pitch-deck-access/${id}/respond`, { approve }),
                                
  incoming: () => api.get("/pitch-deck-access/incoming"),
                                 
  outgoing: () => api.get("/pitch-deck-access/outgoing"),
                                         
  getDeck: (founderId) => api.get(`/pitch-deck-access/deck/${founderId}`),
};
