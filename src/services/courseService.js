import api from "./api";

/**
 * Send an enrollment receipt email to the user.
 * @param {{ email: string, name?: string, courseTitle: string, price: string, paymentMethod: string }} data
 */
const sendCourseReceipt = (data) => api.post("/course/send-receipt", data);

// Founder Course Management APIs
const createCourse = (formData, onUploadProgress) =>
  api.post("/course", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress,
  });

const getMyCourses = (params) => api.get("/course/my-courses", { params });

const updateCourse = (id, formData, onUploadProgress) =>
  api.put(`/course/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress,
  });

const deleteCourse = (id) => api.delete(`/course/${id}`);

// Lesson Upload & Management APIs
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
  createCourse,
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
  createCourse,
  getMyCourses,
  updateCourse,
  deleteCourse,
  addLesson,
  updateLesson,
  deleteLesson,
  getPublishedCourses,
  getCourseById,
};
