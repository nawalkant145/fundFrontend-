import api from "./api";

/**
 * Send an enrollment receipt email to the user.
 * @param {{ email: string, name?: string, courseTitle: string, price: string, paymentMethod: string }} data
 */
const sendCourseReceipt = (data) => api.post("/course/send-receipt", data);

const courseService = { sendCourseReceipt };
export default courseService;
