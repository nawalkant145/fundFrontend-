import api from "./api";

/**
 * Send an enrollment receipt email to the user.
 * @param {{ email: string, name?: string, courseTitle: string, price: string, paymentMethod: string }} data
 */
const sendCourseReceipt = (data) => api.post("/course/send-receipt", data);

// Student Course Purchase & Persistent Enrollment APIs (Founder & Investor)
const purchaseCourse = (data) => api.post("/enrollment/purchase", data);
const getMyEnrolledCourses = () => api.get("/enrollment/my-courses");
const getCourseEnrollment = (courseId) => api.get(`/enrollment/${courseId}`);
const updateCourseProgress = (courseId, data) =>
  api.patch(`/enrollment/${courseId}/progress`, data);
const claimPurchaseToken = (data) => api.post("/enrollment/claim-purchase", data);

// Razorpay Course Payment Gateway APIs
const createPaymentOrder = (data) => api.post("/payment/create-order", data);
const guestCreatePaymentOrder = (data) => api.post("/payment/guest/create-order", data);
const verifyPayment = (data) => api.post("/payment/verify", data);

// Admin Course Management APIs
const createCourse = (formData, onUploadProgress) =>
  api.post("/course", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress,
  });

const getAdminCourses = (params) => api.get("/course/admin-courses", { params });
const getMyCourses = (params) => api.get("/course/my-courses", { params });

const updateCourse = (id, formData, onUploadProgress) =>
  api.put(`/course/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress,
  });

const deleteCourse = (id) => api.delete(`/course/${id}`);

// Lesson Upload & Management APIs (Admin Only)
const addLesson = (courseId, formData, onUploadProgress) =>
  api.post(`/course/${courseId}/lesson`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress,
  });

const updateLesson = (courseId, lessonId, formData, onUploadProgress) =>
  api.put(`/course/${courseId}/lesson/${lessonId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress,
  });

const deleteLesson = (courseId, lessonId) =>
  api.delete(`/course/${courseId}/lesson/${lessonId}`);

// Public / Student Course Browsing APIs
const getPublishedCourses = (params) => api.get("/course", { params });

const getCourseById = (id) => api.get(`/course/${id}`);

const courseService = {
  sendCourseReceipt,
  purchaseCourse,
  getMyEnrolledCourses,
  getCourseEnrollment,
  updateCourseProgress,
  claimPurchaseToken,
  createPaymentOrder,
  guestCreatePaymentOrder,
  verifyPayment,
  createCourse,
  getAdminCourses,
  getMyCourses,
  updateCourse,
  deleteCourse,
  addLesson,
  updateLesson,
  deleteLesson,
  getPublishedCourses,
  getCourseById,
};

export default courseService;
export {
  sendCourseReceipt,
  purchaseCourse,
  getMyEnrolledCourses,
  getCourseEnrollment,
  updateCourseProgress,
  claimPurchaseToken,
  createPaymentOrder,
  guestCreatePaymentOrder,
  verifyPayment,
  createCourse,
  getAdminCourses,
  getMyCourses,
  updateCourse,
  deleteCourse,
  addLesson,
  updateLesson,
  deleteLesson,
  getPublishedCourses,
  getCourseById,
};
