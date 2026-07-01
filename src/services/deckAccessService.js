import api from "./api";

export const deckAccessService = {
  // Investor requests access to a founder's pitch deck
  request: (founderId, message) =>
    api.post("/pitch-deck-access/request", { founderId, message }),
  // Founder approves/denies a request
  respond: (id, approve) =>
    api.put(`/pitch-deck-access/${id}/respond`, { approve }),
  // Founder's incoming requests
  incoming: () => api.get("/pitch-deck-access/incoming"),
  // Investor's outgoing requests
  outgoing: () => api.get("/pitch-deck-access/outgoing"),
  // Investor gets the deck (if approved)
  getDeck: (founderId) => api.get(`/pitch-deck-access/deck/${founderId}`),
};
