import api from "./api";

export const pitchDeckService = {
  request: (founderId, message) =>
    api.post("/pitch-deck-access/request", { founderId, message }),
  respond: (id, approve) =>
    api.put(`/pitch-deck-access/${id}/respond`, { approve }),
  getIncoming: () => api.get("/pitch-deck-access/incoming"),
  getOutgoing: () => api.get("/pitch-deck-access/outgoing"),
  getDeck: (founderId) => api.get(`/pitch-deck-access/deck/${founderId}`),
};
