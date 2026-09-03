import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiAcademicCap,
  HiPlus,
  HiTrash,
  HiPencilAlt,
  HiPlay,
  HiVideoCamera,
  HiDocumentText,
  HiSearch,
  HiCheckCircle,
  HiEye,
  HiUpload,
  HiX,
  HiStar,
  HiClock,
  HiUserGroup,
  HiCurrencyDollar,
  HiTag,
  HiBookOpen,
  HiCheck,
  HiChevronRight,
  HiChevronDown,
  HiChevronUp,
} from "react-icons/hi";
import DashboardShell from "../../components/dashboard/DashboardShell";
import Modal from "../../components/ui/Modal";
import { useToast } from "../../components/ui/Toast";
import { useAuth } from "../../context/AuthContext";
import courseService from "../../services/courseService";

const FALLBACK_COURSES = [
  {
    _id: "demo-1",
    title: "Master the 60-Second Pitch",
    description: "Captivate investors in under a minute with structured hooks and metrics.",
    category: "Pitching",
    level: "all-levels",
    price: 299,
    status: "published",
    thumbnailUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=500&fit=crop",
    previewVideoUrl: "/pitchvideo.mp4",
    modules: [
      {
        title: "Module 1: The 60-Second Hook",
        lessons: [
          { title: "Why 60 Seconds Matters", videoUrl: "/pitchvideo.mp4", duration: 180, isPreview: true },
          { title: "Crafting Your Elevator Statement", videoUrl: "/pitchvideo.mp4", duration: 300, isPreview: false },
        ],
      },
      {
        title: "Module 2: Storytelling & Metrics",
        lessons: [
          { title: "Framing Problem & Solution", videoUrl: "/pitchvideo.mp4", duration: 240, isPreview: false },
          { title: "Traction Metrics Investors Care About", videoUrl: "/pitchvideo.mp4", duration: 360, isPreview: false },
        ],
      },
    ],
  },
  {
    _id: "demo-2",
    title: "Founder Fundamentals",
    description: "From idea to funded startup in 90 days with legal & cap-table templates.",
    category: "Fundraising",
    level: "beginner",
    price: 499,
    status: "published",
    thumbnailUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=500&fit=crop",
    previewVideoUrl: "/videos/appshowcase.mp4",
    modules: [
      {
        title: "Module 1: Validation & PMF",
        lessons: [
          { title: "Idea Validation Framework", videoUrl: "/videos/appshowcase.mp4", duration: 240, isPreview: true },
          { title: "Customer Interview Playbook", videoUrl: "/videos/appshowcase.mp4", duration: 320, isPreview: false },
        ],
      },
    ],
  },
  {
    _id: "demo-3",
    title: "Pitch Deck Mastery",
    description: "Decks that close million-dollar rounds with slide-by-slide breakdowns.",
    category: "Pitching",
    level: "intermediate",
    price: 199,
    status: "published",
    thumbnailUrl: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=500&fit=crop",
    previewVideoUrl: "/videos/herostory.mp4",
    modules: [
      {
        title: "Module 1: The 10 Essential Slides",
        lessons: [
          { title: "Problem, Solution & Market Size", videoUrl: "/videos/herostory.mp4", duration: 320, isPreview: true },
        ],
      },
    ],
  },
];

function ModuleDropdown({ module, moduleIndex, activeLesson, onSelectLesson, defaultOpen = true }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-black/40 border border-gold/15 rounded-xl overflow-hidden transition-all">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-gold/10 hover:bg-gold/20 flex items-center justify-between transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2 text-left truncate">
          <HiBookOpen className="w-4 h-4 text-gold flex-shrink-0" />
          <span className="text-xs font-bold text-gold truncate">
            {module.title || `Module ${moduleIndex + 1}`}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[10px] text-gray-400 font-semibold">
            {module.lessons?.length || 0} lessons
          </span>
          {isOpen ? (
            <HiChevronUp className="w-4 h-4 text-gold" />
          ) : (
            <HiChevronDown className="w-4 h-4 text-gold" />
          )}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-2 space-y-1.5 border-t border-gold/10 bg-black/30">
              {(!module.lessons || module.lessons.length === 0) ? (
                <p className="text-[11px] text-gray-400 italic px-3 py-1">No lessons added yet.</p>
              ) : (
                module.lessons.map((les, lIdx) => (
                  <button
                    key={lIdx}
                    onClick={() => onSelectLesson && onSelectLesson(les)}
                    className={`w-full p-2.5 rounded-lg text-left text-xs font-medium flex items-center justify-between transition-all ${
                      activeLesson?.title === les.title
                        ? "bg-gold text-[#0F4A2E] font-bold shadow-md"
                        : "bg-card-bg/60 text-gray-300 hover:text-white hover:bg-gold/15"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {les.isLocked ? (
                        <HiDocumentText className="w-4 h-4 flex-shrink-0 text-red-400" />
                      ) : les.videoUrl ? (
                        <HiPlay className="w-4 h-4 flex-shrink-0 text-gold" />
                      ) : (
                        <HiDocumentText className="w-4 h-4 flex-shrink-0 text-gray-400" />
                      )}
                      <span className="truncate">{les.title}</span>
                      {les.isPreview && (
                        <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-bold uppercase ml-1">
                          Free Preview
                        </span>
                      )}
                      {les.isLocked && (
                        <span className="text-[9px] bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded font-bold uppercase ml-1">
                          Locked
                        </span>
                      )}
                    </div>
                    {les.duration > 0 && (
                      <span className="text-[10px] opacity-75 font-mono ml-2">
                        {Math.round(les.duration / 60)} min
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AppCoursesPage() {
  const { user } = useAuth();
  const toast = useToast();

  const isAdmin = user?.role === "admin";
  const canPurchase = user?.role === "founder";

  const [activeTab, setActiveTab] = useState(isAdmin ? "admin-courses" : "enrolled");
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [adminCourses, setAdminCourses] = useState([]);
  const [publishedCourses, setPublishedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

                                 
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [selectedCourseForLesson, setSelectedCourseForLesson] = useState(null);
  const [previewCourseModal, setPreviewCourseModal] = useState(null);

                                                         
  const [playerCourse, setPlayerCourse] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);

                             
  const [courseForm, setCourseForm] = useState({
    title: "",
    description: "",
    category: "General",
    level: "all-levels",
    price: 0,
    status: "published",
    tags: "",
  });
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [previewVideoFile, setPreviewVideoFile] = useState(null);
  const [submittingCourse, setSubmittingCourse] = useState(false);

                          
  const [lessonForm, setLessonForm] = useState({
    title: "",
    description: "",
    moduleTitle: "Module 1: Core Curriculum",
    isPreview: false,
  });
  const [lessonVideoFile, setLessonVideoFile] = useState(null);
  const [lessonThumbnailFile, setLessonThumbnailFile] = useState(null);
  const [lessonDocFile, setLessonDocFile] = useState(null);
  const [submittingLesson, setSubmittingLesson] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchCourses();
  }, [user]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      if (isAdmin) {
        const res = await courseService.getAdminCourses();
        const data = res?.data?.data || res?.data;
        setAdminCourses(data?.courses || []);
      }

      if (canPurchase) {
        try {
          const enrollRes = await courseService.getMyEnrolledCourses();
          const enrollData = enrollRes?.data?.data || enrollRes?.data;
          const list = (enrollData?.enrollments || []).map((e) => ({
            ...e.courseId,
            enrollmentProgress: e.progress,
            enrollmentId: e._id,
          }));
          setEnrolledCourses(list);
        } catch (e) {
          console.warn("Could not fetch user enrollments:", e);
        }
      }

      const pubRes = await courseService.getPublishedCourses();
      const pubData = pubRes?.data?.data || pubRes?.data;
      const dbCourses = pubData?.courses || [];

      setPublishedCourses(
        dbCourses.length > 0
          ? [...dbCourses, ...FALLBACK_COURSES]
          : FALLBACK_COURSES
      );
    } catch (err) {
      console.warn("Error fetching catalog courses:", err);
      setPublishedCourses(FALLBACK_COURSES);
    } finally {
      setLoading(false);
    }
  };

  const [purchasingCourseId, setPurchasingCourseId] = useState(null);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleEnroll = async (course) => {
    const courseId = course._id || course.id;
    const isEnrolledAlready = enrolledCourses.some((c) => (c._id || c.id) === courseId);

    if (isEnrolledAlready) {
      toast.info("You are already enrolled in this course!");
      openCoursePlayer(course);
      setPreviewCourseModal(null);
      return;
    }

    if (!course._id || course._id.startsWith("demo-")) {
      toast.info("This is a preview course. Real published course required for Razorpay checkout.");
      return;
    }

    setPurchasingCourseId(courseId);
    try {
                                           
      const res = await courseService.createPaymentOrder({ courseId });
      const resData = res.data?.data || res.data;

                                       
      if (resData.isFree) {
        toast.success(`🎉 Free course unlocked! Enrolled in "${course.title}".`);
        await fetchCourses();
        setPreviewCourseModal(null);
        setActiveTab("enrolled");
        openCoursePlayer(course);
        setPurchasingCourseId(null);
        return;
      }

      const { order, keyId } = resData;

                                      
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Failed to load Razorpay payment SDK. Please check your internet connection.");
        setPurchasingCourseId(null);
        return;
      }

                                                   
      const options = {
        key: keyId,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "Expglo Academy",
        description: course.title,
        order_id: order.id,
        prefill: {
          name: user?.name || user?.firstName || "",
          email: user?.email || "",
        },
        theme: {
          color: "#176B4D",
        },
        modal: {
          ondismiss: () => {
            setPurchasingCourseId(null);
          },
        },
        handler: async function (response) {
          try {
            toast.info("Verifying payment with backend...");
                                                                                                
            await courseService.verifyPayment({
              courseId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            toast.success(`🎉 Payment verified! Enrolled in "${course.title}".`);
            await fetchCourses();
            setPreviewCourseModal(null);
            setActiveTab("enrolled");
            openCoursePlayer(course);
          } catch (verifyErr) {
            console.error("Payment verification error:", verifyErr);
            toast.error(
              verifyErr.response?.data?.message || "Payment verification failed server-side."
            );
          } finally {
            setPurchasingCourseId(null);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        setPurchasingCourseId(null);
        toast.error(response.error?.description || "Payment failed or was declined.");
      });
      rzp.open();
    } catch (err) {
      console.error("Razorpay order creation error:", err);
      toast.error(
        err.response?.data?.message || "Unable to create payment order. Please try again."
      );
      setPurchasingCourseId(null);
    }
  };

  const openCoursePlayer = async (course) => {
    let fullCourse = course;
    if (course._id && !course._id.startsWith("demo-")) {
      try {
        const res = await courseService.getCourseById(course._id);
        fullCourse = res?.data?.data?.course || res?.data?.course || course;
      } catch (e) {
        console.warn("Could not fetch detailed course info:", e);
      }
    }
    setPlayerCourse(fullCourse);

    let firstLesson = null;
    if (fullCourse.modules && fullCourse.modules.length > 0) {
      for (const mod of fullCourse.modules) {
        if (mod.lessons && mod.lessons.length > 0) {
          firstLesson = mod.lessons[0];
          break;
        }
      }
    }
    setActiveLesson(firstLesson);
  };

  const handleSelectLessonInPlayer = (lesson) => {
    if (lesson.isLocked) {
      toast.error("This lesson is locked. Please purchase the course to access.");
      return;
    }
    setActiveLesson(lesson);
    if (playerCourse && playerCourse._id && !playerCourse._id.startsWith("demo-") && canPurchase) {
      courseService
        .updateCourseProgress(playerCourse._id, {
          lessonId: lesson.title || lesson._id,
          completed: true,
        })
        .catch(() => {});
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!courseForm.title.trim()) {
      toast.error("Course title is required");
      return;
    }

    setSubmittingCourse(true);
    setUploadProgress(0);
    try {
      const formData = new FormData();
      formData.append("title", courseForm.title);
      formData.append("description", courseForm.description);
      formData.append("category", courseForm.category);
      formData.append("level", courseForm.level);
      formData.append("price", courseForm.price);
      formData.append("status", courseForm.status);
      formData.append("tags", courseForm.tags);

      if (thumbnailFile) {
        formData.append("thumbnail", thumbnailFile);
      }

      await courseService.createCourse(formData, (event) => {
        if (event.total) {
          setUploadProgress(Math.round((event.loaded * 100) / event.total));
        }
      });
      toast.success("Course created successfully!");
      setShowCreateModal(false);
      setCourseForm({
        title: "",
        description: "",
        category: "General",
        level: "all-levels",
        price: 0,
        status: "published",
        tags: "",
      });
      setThumbnailFile(null);
      setPreviewVideoFile(null);
      fetchCourses();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create course");
    } finally {
      setSubmittingCourse(false);
    }
  };

  const handleAddLesson = async (e) => {
    e.preventDefault();
    if (!selectedCourseForLesson) return;
    if (!lessonForm.title.trim()) {
      toast.error("Lesson title is required");
      return;
    }

    setSubmittingLesson(true);
    setUploadProgress(0);
    try {
      const formData = new FormData();
      formData.append("title", lessonForm.title);
      formData.append("description", lessonForm.description);
      formData.append("moduleTitle", lessonForm.moduleTitle);
      formData.append("isPreview", lessonForm.isPreview);

      if (lessonVideoFile) {
        formData.append("video", lessonVideoFile);
      }
      if (lessonThumbnailFile) {
        formData.append("thumbnail", lessonThumbnailFile);
      }
      if (lessonDocFile) {
        formData.append("document", lessonDocFile);
      }

      await courseService.addLesson(selectedCourseForLesson._id, formData, (event) => {
        if (event.total) {
          setUploadProgress(Math.round((event.loaded * 100) / event.total));
        }
      });
      toast.success("Lesson video added to course!");
      setShowLessonModal(false);
      setLessonForm({
        title: "",
        description: "",
        moduleTitle: "Module 1: Core Curriculum",
        isPreview: false,
      });
      setLessonVideoFile(null);
      setLessonThumbnailFile(null);
      setLessonDocFile(null);
      fetchCourses();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add lesson");
    } finally {
      setSubmittingLesson(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      await courseService.deleteCourse(courseId);
      toast.success("Course deleted");
      fetchCourses();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete course");
    }
  };

                          
  const filteredExploreCourses = publishedCourses.filter((c) => {
    const matchesSearch =
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" ||
      c.category?.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <DashboardShell
      title="EXPGLO Academy & Courses"
      subtitle={
        isAdmin
          ? "Admin Portal: Create and manage masterclasses, modules, and video lessons."
          : "Master fundraising, pitching, and startup scaling with video masterclasses."
      }
    >
      {                 }
      <div className="flex items-center justify-between border-b border-gold/15 pb-4 mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-3 overflow-x-auto pb-1">
          {canPurchase && (
            <button
              onClick={() => setActiveTab("enrolled")}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === "enrolled"
                  ? "bg-gold text-[#0F4A2E] shadow-md"
                  : "bg-card-bg/60 text-gray-300 hover:text-white border border-gold/15"
              }`}
            >
              <HiBookOpen className="w-5 h-5" />
              My Learning ({enrolledCourses.length})
            </button>
          )}

          <button
            onClick={() => setActiveTab("explore")}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === "explore"
                ? "bg-gold text-[#0F4A2E] shadow-md"
                : "bg-card-bg/60 text-gray-300 hover:text-white border border-gold/15"
            }`}
          >
            <HiSearch className="w-5 h-5" />
            Explore Catalog ({publishedCourses.length})
          </button>

          {isAdmin && (
            <button
              onClick={() => setActiveTab("admin-courses")}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === "admin-courses"
                  ? "bg-gold text-[#0F4A2E] shadow-md"
                  : "bg-card-bg/60 text-gray-300 hover:text-white border border-gold/15"
              }`}
            >
              <HiAcademicCap className="w-5 h-5" />
              Admin Course Management ({adminCourses.length})
            </button>
          )}
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white font-bold text-sm rounded-xl shadow-lg hover:from-emerald-500 hover:to-emerald-700 flex items-center gap-2 transition-all"
          >
            <HiPlus className="w-5 h-5" />
            Create New Course
          </button>
        )}
      </div>

      {                                                             }
      {canPurchase && activeTab === "enrolled" && (
        <div className="space-y-6">
          {enrolledCourses.length === 0 ? (
            <div className="bg-card-bg/60 border border-gold/15 rounded-3xl p-10 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-gold/15 flex items-center justify-center mx-auto text-gold">
                <HiBookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">No courses enrolled yet</h3>
              <p className="text-sm text-gray-400 max-w-md mx-auto">
                Explore our curated startup fundraising & pitching masterclasses and unlock lifetime access.
              </p>
              <button
                onClick={() => setActiveTab("explore")}
                className="px-6 py-3 bg-gold text-[#0F4A2E] font-bold text-sm rounded-xl shadow-lg hover:bg-[#FFD166] inline-flex items-center gap-2 transition-all"
              >
                <HiSearch className="w-5 h-5" />
                Browse Course Catalog
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((course) => (
                <div
                  key={course._id || course.id}
                  className="bg-card-bg/80 border border-gold/20 rounded-3xl overflow-hidden shadow-lg flex flex-col justify-between hover:border-gold/40 transition-all group"
                >
                  <div>
                    <div className="relative h-48 bg-black overflow-hidden">
                      <img
                        src={
                          course.thumbnailUrl ||
                          course.thumbnail ||
                          "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=500&fit=crop"
                        }
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-3 right-3 px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold text-[10px] uppercase tracking-wider rounded-full backdrop-blur">
                        ✓ Enrolled
                      </span>
                    </div>

                    <div className="p-6 space-y-3">
                      <span className="px-2.5 py-1 bg-gold/15 text-gold font-bold rounded-full uppercase tracking-wider text-[10px]">
                        {course.category || "Masterclass"}
                      </span>
                      <h3 className="font-bold text-xl text-white line-clamp-1">
                        {course.title}
                      </h3>
                      <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                        {course.description || course.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 border-t border-gold/10 bg-black/30 flex items-center justify-between gap-3">
                    <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                      <HiCheckCircle className="w-4 h-4" /> Lifetime Access
                    </span>
                    <button
                      onClick={() => openCoursePlayer(course)}
                      className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-500 hover:to-emerald-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all"
                    >
                      <HiPlay className="w-4 h-4 text-gold" /> Continue Learning
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {                                              }
      {isAdmin && activeTab === "admin-courses" && (
        <div className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
            </div>
          ) : adminCourses.length === 0 ? (
            <div className="bg-card-bg/60 border border-gold/15 rounded-3xl p-10 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-gold/15 flex items-center justify-center mx-auto text-gold">
                <HiAcademicCap className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">No courses created yet</h3>
              <p className="text-sm text-gray-400 max-w-md mx-auto">
                Create new startup masterclasses, attach modules, and upload video lessons for founders & investors.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-gold text-[#0F4A2E] font-bold text-sm rounded-xl shadow-lg hover:bg-[#FFD166] inline-flex items-center gap-2 transition-all"
              >
                <HiPlus className="w-5 h-5" />
                Create First Course
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {adminCourses.map((course) => (
                <div
                  key={course._id}
                  className="bg-card-bg/80 border border-gold/20 rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-44 bg-black">
                      <img
                        src={
                          course.thumbnailUrl ||
                          "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=500&fit=crop"
                        }
                        alt={course.title}
                        className="w-full h-full object-cover opacity-80"
                      />
                      <span
                        className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          course.status === "published"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                        }`}
                      >
                        {course.status}
                      </span>
                    </div>

                    <div className="p-5 space-y-3">
                      <h3 className="font-bold text-lg text-white line-clamp-1">
                        {course.title}
                      </h3>
                      <p className="text-xs text-gray-400 line-clamp-2">
                        {course.description || "No description provided."}
                      </p>

                      <div className="flex items-center justify-between text-xs text-gray-300 pt-2 border-t border-gold/10">
                        <span className="font-semibold text-gold">
                          ${course.price || 0}
                        </span>
                        <span className="text-gray-400">
                          {course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0} lessons
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-black/40 border-t border-gold/15 flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        setSelectedCourseForLesson(course);
                        setShowLessonModal(true);
                      }}
                      className="px-3 py-1.5 bg-gold/15 hover:bg-gold/25 text-gold text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all"
                    >
                      <HiPlus className="w-4 h-4" />
                      Add Lesson Video
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course._id)}
                      className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                      title="Delete Course"
                    >
                      <HiTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {                         }
      {activeTab === "explore" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <HiSearch className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-card-bg/60 border border-gold/20 rounded-xl text-xs text-white placeholder-gray-400 focus:outline-none focus:border-gold"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
              {["All", "Pitching", "Fundraising", "General"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? "bg-gold text-[#0F4A2E]"
                      : "bg-card-bg/60 text-gray-300 hover:text-white border border-gold/15"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExploreCourses.map((course) => {
              const isAlreadyEnrolled = enrolledCourses.some(
                (c) => (c._id || c.id) === (course._id || course.id)
              );
              return (
                <div
                  key={course._id || course.id}
                  className="bg-card-bg/80 border border-gold/15 rounded-3xl overflow-hidden shadow-lg flex flex-col justify-between hover:border-gold/35 transition-all group"
                >
                  <div>
                    <div
                      className="relative h-48 bg-black overflow-hidden cursor-pointer"
                      onClick={() => setPreviewCourseModal(course)}
                    >
                      <img
                        src={
                          course.thumbnailUrl ||
                          course.thumbnail ||
                          "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=500&fit=crop"
                        }
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        {(course.previewVideoUrl || course.videoUrl) ? (
                          <span className="px-4 py-2 bg-gold text-[#0F4A2E] text-xs font-bold rounded-full shadow-lg flex items-center gap-1.5">
                            <HiPlay className="w-4 h-4" /> Watch Video Preview
                          </span>
                        ) : (
                          <span className="px-4 py-2 bg-gold text-[#0F4A2E] text-xs font-bold rounded-full shadow-lg flex items-center gap-1.5">
                            <HiEye className="w-4 h-4" /> View Details
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-6 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="px-2.5 py-1 bg-gold/15 text-gold font-bold rounded-full uppercase tracking-wider text-[10px]">
                          {course.category || "General"}
                        </span>
                        <span className="text-gray-400 capitalize">{course.level || "All levels"}</span>
                      </div>

                      <h3 className="font-bold text-xl text-white line-clamp-1">
                        {course.title}
                      </h3>
                      <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                        {course.description || course.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 border-t border-gold/10 flex items-center justify-between gap-2">
                    <span className="text-xl font-bold text-gold">
                      {typeof course.price === "number" ? `$${course.price}` : course.price || "Free"}
                    </span>
                    {isAlreadyEnrolled ? (
                      <button
                        onClick={() => openCoursePlayer(course)}
                        className="px-4 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold rounded-xl shadow-md flex items-center gap-1"
                      >
                        <HiCheckCircle className="w-4 h-4" /> Continue Learning
                      </button>
                    ) : (
                      <button
                        onClick={() => setPreviewCourseModal(course)}
                        className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-500 hover:to-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all"
                      >
                        Enroll Now
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {                                      }
      {isAdmin && (
        <Modal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create & Upload New Course (Admin)"
        >
          <form onSubmit={handleCreateCourse} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">
                Course Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Master the 60-Second Pitch"
                value={courseForm.title}
                onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                className="w-full px-3 py-2 bg-card-bg border border-gold/20 rounded-xl text-xs text-white focus:outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">
                Course Description & Curriculum Highlights
              </label>
              <textarea
                rows={4}
                placeholder="e.g. Master the art of pitching in 60 seconds."
                value={courseForm.description}
                onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                className="w-full px-3 py-2 bg-card-bg border border-gold/20 rounded-xl text-xs text-white focus:outline-none focus:border-gold whitespace-pre-line"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  Category
                </label>
                <select
                  value={courseForm.category}
                  onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                  className="w-full px-3 py-2 bg-card-bg border border-gold/20 rounded-xl text-xs text-white focus:outline-none focus:border-gold"
                >
                  <option value="General">General</option>
                  <option value="Pitching">Pitching</option>
                  <option value="Fundraising">Fundraising</option>
                  <option value="Financials">Financials</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  Price ($)
                </label>
                <input
                  type="number"
                  min="0"
                  value={courseForm.price}
                  onChange={(e) => setCourseForm({ ...courseForm, price: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-card-bg border border-gold/20 rounded-xl text-xs text-white focus:outline-none focus:border-gold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  Course Thumbnail Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setThumbnailFile(e.target.files[0])}
                  className="w-full text-xs text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-gold/15 file:text-gold hover:file:bg-gold/25 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  Course Preview Video (Intro / Trailer File)
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setPreviewVideoFile(e.target.files[0])}
                  className="w-full text-xs text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-gold/15 file:text-gold hover:file:bg-gold/25 cursor-pointer"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingCourse}
                className="px-6 py-2 bg-gold text-[#0F4A2E] rounded-xl text-xs font-bold hover:bg-[#FFD166] disabled:opacity-50"
              >
                {submittingCourse ? "Creating..." : "Create Course"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {                                   }
      {isAdmin && (
        <Modal
          open={showLessonModal}
          onClose={() => setShowLessonModal(false)}
          title={`Add Lesson Video & Resources to "${selectedCourseForLesson?.title || ""}" (Admin)`}
        >
          <form onSubmit={handleAddLesson} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">
                Lesson Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Crafting Your Elevator Hook"
                value={lessonForm.title}
                onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                className="w-full px-3 py-2 bg-card-bg border border-gold/20 rounded-xl text-xs text-white focus:outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">
                Module Name
              </label>
              <input
                type="text"
                placeholder="e.g. Module 1: The 60-Second Hook"
                value={lessonForm.moduleTitle}
                onChange={(e) => setLessonForm({ ...lessonForm, moduleTitle: e.target.value })}
                className="w-full px-3 py-2 bg-card-bg border border-gold/20 rounded-xl text-xs text-white focus:outline-none focus:border-gold"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isPreview"
                checked={lessonForm.isPreview}
                onChange={(e) => setLessonForm({ ...lessonForm, isPreview: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-gold/30 bg-card-bg"
              />
              <label htmlFor="isPreview" className="text-xs text-gray-300 font-semibold cursor-pointer">
                Allow as Free Preview (accessible without purchase)
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  Lesson Video File (MP4/WEBM) *
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setLessonVideoFile(e.target.files[0])}
                  className="w-full text-xs text-gray-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gold/15 file:text-gold hover:file:bg-gold/25 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  Video Thumbnail (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setLessonThumbnailFile(e.target.files[0])}
                  className="w-full text-xs text-gray-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gold/15 file:text-gold hover:file:bg-gold/25 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  Resource File (PDF/DOC)
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,image/*"
                  onChange={(e) => setLessonDocFile(e.target.files[0])}
                  className="w-full text-xs text-gray-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gold/15 file:text-gold hover:file:bg-gold/25 cursor-pointer"
                />
              </div>
            </div>

            {submittingLesson && (
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs font-bold text-gold">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    Uploading Video & Media to Cloud Storage...
                  </span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-2.5 bg-black/60 rounded-full overflow-hidden border border-gold/20">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 via-gold to-yellow-400 transition-all duration-300 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="pt-4 flex justify-end gap-3">
              <button
                type="button"
                disabled={submittingLesson}
                onClick={() => setShowLessonModal(false)}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingLesson}
                className="px-6 py-2 bg-gold text-[#0F4A2E] rounded-xl text-xs font-bold hover:bg-[#FFD166] disabled:opacity-50 flex items-center gap-2"
              >
                {submittingLesson ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-[#0F4A2E] border-t-transparent rounded-full animate-spin" />
                    <span>Uploading ({uploadProgress}%)</span>
                  </>
                ) : (
                  "Add Lesson Video"
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {                                              }
      <Modal
        open={!!previewCourseModal}
        onClose={() => setPreviewCourseModal(null)}
        title={previewCourseModal?.title || "Course Details"}
      >
        {previewCourseModal && (
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-video border border-gold/20">
              {(previewCourseModal.previewVideoUrl || previewCourseModal.videoUrl) ? (
                <video
                  controls
                  autoPlay
                  src={previewCourseModal.previewVideoUrl || previewCourseModal.videoUrl}
                  poster={previewCourseModal.thumbnailUrl || previewCourseModal.thumbnail}
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={
                    previewCourseModal.thumbnailUrl ||
                    previewCourseModal.thumbnail ||
                    "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=500&fit=crop"
                  }
                  alt={previewCourseModal.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">
              {previewCourseModal.description || previewCourseModal.subtitle}
            </p>

            {previewCourseModal.modules && previewCourseModal.modules.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-gold/15">
                <p className="text-xs font-bold text-gray-300 mb-1">Curriculum & Modules:</p>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {previewCourseModal.modules.map((mod, mIdx) => (
                    <ModuleDropdown
                      key={mIdx}
                      module={mod}
                      moduleIndex={mIdx}
                      defaultOpen={mIdx === 0}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-between items-center border-t border-gold/15">
              <span className="text-lg font-bold text-gold">
                Price: {typeof previewCourseModal.price === "number" ? `$${previewCourseModal.price}` : previewCourseModal.price || "Free"}
              </span>
              {canPurchase && (
                <button
                  disabled={purchasingCourseId === (previewCourseModal._id || previewCourseModal.id)}
                  onClick={() => handleEnroll(previewCourseModal)}
                  className="px-6 py-2 bg-gold text-[#0F4A2E] font-bold text-xs rounded-xl shadow-md hover:bg-[#FFD166] transition-all disabled:opacity-50"
                >
                  {purchasingCourseId === (previewCourseModal._id || previewCourseModal.id)
                    ? "Opening Razorpay..."
                    : "Purchase & Enroll Now"}
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {                                                                             }
      <Modal
        open={!!playerCourse}
        onClose={() => setPlayerCourse(null)}
        title={playerCourse?.title || "Course Player"}
      >
        {playerCourse && (
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-video border border-gold/20 shadow-2xl">
              {(activeLesson?.videoUrl || playerCourse.previewVideoUrl || playerCourse.videoUrl) ? (
                <video
                  key={activeLesson?.videoUrl || activeLesson?.title || playerCourse.previewVideoUrl}
                  controls
                  autoPlay
                  src={activeLesson?.videoUrl || playerCourse.previewVideoUrl || playerCourse.videoUrl}
                  poster={activeLesson?.thumbnailUrl || playerCourse.thumbnailUrl || playerCourse.thumbnail}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-black/80 text-gray-400 p-6 text-center">
                  <HiDocumentText className="w-12 h-12 text-gold mb-2" />
                  <p className="text-sm font-bold text-white">
                    {activeLesson?.isLocked ? "Lesson Locked" : "Media Resource"}
                  </p>
                  <p className="text-xs text-gray-400 max-w-sm mt-1">
                    {activeLesson?.isLocked
                      ? "Purchase this course to unlock full video access."
                      : activeLesson?.title || "No video file attached for this lesson."}
                  </p>
                </div>
              )}
            </div>

            <div className="p-3 bg-gold/10 border border-gold/20 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gold font-bold uppercase tracking-wider">Now Playing</p>
                <h4 className="text-sm font-bold text-white">
                  {activeLesson?.title || playerCourse.title}
                </h4>
              </div>
              <span
                className={`px-2.5 py-1 font-bold text-[10px] rounded-full border ${
                  activeLesson?.isLocked
                    ? "bg-red-500/20 text-red-400 border-red-500/30"
                    : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                }`}
              >
                {activeLesson?.isLocked ? "🔒 Locked" : "✓ Unlocked"}
              </span>
            </div>

            {activeLesson?.description && (
              <div className="p-3 bg-black/40 border border-gold/15 rounded-xl">
                <p className="text-[10px] text-gold font-bold uppercase tracking-wider mb-1">Lesson Notes</p>
                <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">
                  {activeLesson.description}
                </p>
              </div>
            )}

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              <p className="text-xs font-bold text-gray-300">Course Syllabus & Lessons:</p>
              {playerCourse.modules?.map((mod, mIdx) => (
                <ModuleDropdown
                  key={mIdx}
                  module={mod}
                  moduleIndex={mIdx}
                  activeLesson={activeLesson}
                  onSelectLesson={handleSelectLessonInPlayer}
                  defaultOpen={mIdx === 0}
                />
              ))}
            </div>
          </div>
        )}
      </Modal>
    </DashboardShell>
  );
}
