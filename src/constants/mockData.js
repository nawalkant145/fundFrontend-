// Static mock data used across all dashboard pages.
// When backend wires up, replace with API calls.

import { getRole } from "../lib/auth";

const FOUNDER_PROFILE = {
  _id: "u_self",
  name: "Aarav Sharma",
  username: "aarav_builds",
  email: "aarav@example.com",
  avatar:
    "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200&h=200&fit=crop",
  role: "founder",
  isVerified: true,
  verificationLevel: 3,
  companyName: "NovaMed AI",
  industry: "HealthTech",
  fundingStage: "seed",
  bio: "Building diagnostic AI for under-resourced clinics across South Asia.",
  website: "https://novamed.ai",
  linkedIn: "https://linkedin.com/in/aarav",
  profileCompleteness: 92,
};

const INVESTOR_PROFILE = {
  _id: "u_self_inv",
  name: "Vikram Patel",
  username: "vikram_invests",
  email: "vikram@altva.com",
  avatar:
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop",
  role: "investor",
  isVerified: true,
  verificationLevel: 3,
  bio: "Backing early-stage founders in HealthTech, Climate, and AI.",
  investmentRange: { min: 500000, max: 20000000 },
  preferredIndustries: ["HealthTech", "Climate", "AI / ML"],
  preferredStages: ["Pre-Seed", "Seed", "Series A"],
  totalInvested: 12500000,
  portfolioCompanies: ["NovaMed AI", "GreenChain", "EduForge"],
  investmentThesis: "Mission-driven founders solving structural problems.",
  linkedIn: "https://linkedin.com/in/vikram",
  profileCompleteness: 88,
};

const ADMIN_PROFILE = {
  _id: "u_self_adm",
  name: "Admin Console",
  username: "admin",
  email: "admin@expglofund.com",
  avatar:
    "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200&h=200&fit=crop",
  role: "admin",
  isVerified: true,
  verificationLevel: 3,
  profileCompleteness: 100,
};

const PROFILES = {
  founder: FOUNDER_PROFILE,
  investor: INVESTOR_PROFILE,
  admin: ADMIN_PROFILE,
};

// Reactively reads the active role from auth at every access.
// Falls back to founder for previewing without login.
export const CURRENT_USER = new Proxy(
  {},
  {
    get(_, key) {
      const role = getRole() || "founder";
      const profile = PROFILES[role] || FOUNDER_PROFILE;
      return profile[key];
    },
  },
);

export const MOCK_PITCHES = [
  {
    _id: "v_1",
    founderId: {
      _id: "f_1",
      name: "Aisha Kamara",
      avatar:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop",
      companyName: "NovaMed AI",
      isVerified: true,
    },
    title: "AI Diagnostics for Rural Clinics",
    description:
      "Our edge-AI device runs on a phone and gives clinical-grade screening for cardiac and respiratory issues in 30 seconds. Already deployed in 14 clinics.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=1200&fit=crop",
    videoUrl: "/mockvideo/pitch1.mp4",
    duration: 87,
    industry: "HealthTech",
    fundingStage: "seed",
    askAmount: 18000000,
    equityOffered: 8,
    views: 4200,
    likes: Array(312).fill("x"),
    saves: Array(89).fill("x"),
    comments: 47,
    createdAt: "2026-05-22",
  },
  {
    _id: "v_2",
    founderId: {
      _id: "f_2",
      name: "Rahul Mehta",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
      companyName: "GreenChain",
      isVerified: true,
    },
    title: "Carbon Credits, On-Chain & Verifiable",
    description:
      "We tokenize verified carbon offsets so businesses can buy, retire, and prove climate action in a single click. ₹12Cr revenue last year.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=800&h=1200&fit=crop",
    videoUrl: "/mockvideo/pitch2.mp4",
    duration: 110,
    industry: "Climate",
    fundingStage: "series-a",
    askAmount: 40000000,
    equityOffered: 6,
    views: 8740,
    likes: Array(521).fill("x"),
    saves: Array(140).fill("x"),
    comments: 92,
    createdAt: "2026-05-18",
  },
  {
    _id: "v_3",
    founderId: {
      _id: "f_3",
      name: "Sofia Chen",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
      companyName: "EduForge",
      isVerified: false,
    },
    title: "Personalized Tutors, Powered by LLMs",
    description:
      "Adaptive learning paths in 8 Indian languages. Used by 12,000 students with 85% completion rate.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=1200&fit=crop",
    videoUrl: "/mockvideo/pitch3.mp4",
    duration: 75,
    industry: "EdTech",
    fundingStage: "pre-seed",
    askAmount: 8000000,
    equityOffered: 12,
    views: 3100,
    likes: Array(198).fill("x"),
    saves: Array(54).fill("x"),
    comments: 31,
    createdAt: "2026-05-26",
  },
  {
    _id: "v_4",
    founderId: {
      _id: "f_4",
      name: "Marcus Webb",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
      companyName: "SupplySync",
      isVerified: true,
    },
    title: "Real-Time Supply Chain for SMBs",
    description:
      "We give small businesses Fortune 500-grade visibility into their inventory and shipping for ₹4,999/mo.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=1200&fit=crop",
    videoUrl: "/mockvideo/pitch4.mp4",
    duration: 95,
    industry: "Logistics",
    fundingStage: "seed",
    askAmount: 25000000,
    equityOffered: 7,
    views: 6300,
    likes: Array(403).fill("x"),
    saves: Array(112).fill("x"),
    comments: 58,
    createdAt: "2026-05-15",
  },
  {
    _id: "v_5",
    founderId: {
      _id: "f_5",
      name: "Priya Iyer",
      avatar:
        "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&h=200&fit=crop",
      companyName: "FarmPulse",
      isVerified: true,
    },
    title: "Soil Health, On Demand",
    description:
      "Smartphone-based soil scanner gives farmers a free reading + fertilizer plan in 60 seconds.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=1200&fit=crop",
    videoUrl: "/mockvideo/pitch5.mp4",
    duration: 102,
    industry: "AgriTech",
    fundingStage: "seed",
    askAmount: 12000000,
    equityOffered: 10,
    views: 5210,
    likes: Array(287).fill("x"),
    saves: Array(76).fill("x"),
    comments: 41,
    createdAt: "2026-05-20",
  },
];

export const MOCK_CHATS = [
  {
    _id: "c_1",
    founderId: {
      _id: "f_1",
      name: "Aisha Kamara",
      avatar: MOCK_PITCHES[0].founderId.avatar,
      isOnline: true,
    },
    investorId: {
      _id: "i_1",
      name: "Vikram Patel",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop",
      isOnline: true,
    },
    lastMessage: "Sounds great. Can we hop on a call tomorrow at 4pm IST?",
    lastMessageAt: "2 min ago",
    unread: 2,
  },
  {
    _id: "c_2",
    founderId: {
      _id: "f_2",
      name: "Rahul Mehta",
      avatar: MOCK_PITCHES[1].founderId.avatar,
      isOnline: false,
    },
    investorId: {
      _id: "i_2",
      name: "Meera Kapoor",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
      isOnline: true,
    },
    lastMessage: "Sent you the latest deck. Let me know what you think.",
    lastMessageAt: "1 hr ago",
    unread: 0,
  },
  {
    _id: "c_3",
    founderId: {
      _id: "f_3",
      name: "Sofia Chen",
      avatar: MOCK_PITCHES[2].founderId.avatar,
      isOnline: false,
    },
    investorId: {
      _id: "i_3",
      name: "Arjun Nair",
      avatar:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop",
      isOnline: false,
    },
    lastMessage: "Loved the demo. Following up by email.",
    lastMessageAt: "Yesterday",
    unread: 0,
  },
  {
    _id: "c_4",
    founderId: {
      _id: "f_4",
      name: "Marcus Webb",
      avatar: MOCK_PITCHES[3].founderId.avatar,
      isOnline: true,
    },
    investorId: {
      _id: "i_4",
      name: "Karan Mehta",
      avatar:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop",
      isOnline: false,
    },
    lastMessage: "What's your monthly burn?",
    lastMessageAt: "2d",
    unread: 0,
  },
];

export const MOCK_MESSAGES = [
  {
    _id: "m1",
    senderId: "i_1",
    text: "Hey Aisha, watched your pitch. Really impressed by the deployment numbers.",
    createdAt: "10:02 AM",
  },
  {
    _id: "m2",
    senderId: "u_self",
    text: "Thanks Vikram, that means a lot. Happy to share more on traction.",
    createdAt: "10:04 AM",
  },
  {
    _id: "m3",
    senderId: "i_1",
    text: "What's the unit economics looking like at scale?",
    createdAt: "10:06 AM",
  },
  {
    _id: "m4",
    senderId: "u_self",
    text: "Gross margin is 68% at 1k devices/month. Sending you the deck.",
    createdAt: "10:09 AM",
  },
  {
    _id: "m5",
    senderId: "u_self",
    text: "Here is the link to our pitch deck.",
    createdAt: "10:09 AM",
    type: "file",
    fileUrl: "deck.pdf",
  },
  {
    _id: "m6",
    senderId: "i_1",
    text: "Sounds great. Can we hop on a call tomorrow at 4pm IST?",
    createdAt: "10:12 AM",
  },
];

export const MOCK_NOTIFICATIONS = [
  {
    _id: "n1",
    type: "like",
    title: "Vikram Patel liked your pitch",
    body: "AI Diagnostics for Rural Clinics",
    createdAt: "2 min ago",
    isRead: false,
  },
  {
    _id: "n2",
    type: "investment",
    title: "Meera Kapoor expressed investment interest",
    body: "Proposed amount: ₹50,00,000",
    createdAt: "1 hr ago",
    isRead: false,
  },
  {
    _id: "n3",
    type: "save",
    title: "3 investors saved your pitch",
    body: "Your pitch is gaining traction",
    createdAt: "3 hr ago",
    isRead: false,
  },
  {
    _id: "n4",
    type: "match",
    title: "New mutual match — Arjun Nair",
    body: "Start chatting now",
    createdAt: "Yesterday",
    isRead: true,
  },
  {
    _id: "n5",
    type: "system",
    title: "Documents approved",
    body: "You are now fully verified! Blue tick activated.",
    createdAt: "2 days ago",
    isRead: true,
  },
  {
    _id: "n6",
    type: "pitch_views",
    title: "5 investors viewed your pitch today",
    body: "Keep the momentum going",
    createdAt: "3 days ago",
    isRead: true,
  },
];

export const MOCK_DEALS = [
  {
    _id: "d1",
    investorId: {
      _id: "i_1",
      name: "Vikram Patel",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop",
    },
    founderId: { _id: "f_1", name: "Aisha Kamara", companyName: "NovaMed AI" },
    amount: 5000000,
    equity: 2.5,
    stage: "agreed",
    status: "pending",
    updatedAt: "Today",
  },
  {
    _id: "d2",
    investorId: {
      _id: "i_2",
      name: "Meera Kapoor",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
    },
    founderId: { _id: "f_1", name: "Aisha Kamara", companyName: "NovaMed AI" },
    amount: 2500000,
    equity: 1.5,
    stage: "negotiating",
    status: "pending",
    updatedAt: "Yesterday",
  },
  {
    _id: "d3",
    investorId: {
      _id: "i_3",
      name: "Arjun Nair",
      avatar:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop",
    },
    founderId: { _id: "f_1", name: "Aisha Kamara", companyName: "NovaMed AI" },
    amount: 10000000,
    equity: 4,
    stage: "completed",
    status: "paid",
    updatedAt: "1 week ago",
  },
];

export const MOCK_ADMIN_STATS = {
  users: {
    total: 3247,
    founders: 1825,
    investors: 1420,
    admins: 2,
    banned: 12,
    newToday: 47,
    new7d: 312,
  },
  videos: {
    total: 1832,
    active: 1614,
    processing: 23,
    expired: 145,
    rejected: 50,
    pendingReview: 23,
  },
  pending: { documents: 84, reports: 12 },
  investments: { total: 412, completed: 168, totalAmount: 8420000000 },
  calls: { active: 8, total7d: 1247 },
  chats: { active: 4892, messages24h: 15600 },
};

export const formatINR = (n) => {
  if (!n && n !== 0) return "—";
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)} K`;
  return `₹${n}`;
};

// Each founder's other / past pitches — used for the profile modal grid
export const FOUNDER_PROFILES = {
  f_1: {
    bio: "Building diagnostic AI for under-resourced clinics across South Asia.",
    location: "Bangalore, India",
    followers: 1240,
    following: 89,
    totalPitches: 4,
    website: "https://novamed.ai",
    pitches: [
      MOCK_PITCHES[0],
      {
        ...MOCK_PITCHES[0],
        _id: "v_1_2",
        title: "Series A demo — clinical results",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=600&fit=crop",
        views: 2100,
        likes: Array(160).fill("x"),
      },
      {
        ...MOCK_PITCHES[0],
        _id: "v_1_3",
        title: "How our edge AI works in 90s",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=400&h=600&fit=crop",
        views: 980,
        likes: Array(72).fill("x"),
      },
      {
        ...MOCK_PITCHES[0],
        _id: "v_1_4",
        title: "Customer story — Aayush Hospital",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1551076805-e1869033e561?w=400&h=600&fit=crop",
        views: 1450,
        likes: Array(110).fill("x"),
      },
    ],
  },
  f_2: {
    bio: "Tokenizing carbon offsets to make climate action verifiable.",
    location: "Mumbai, India",
    followers: 3210,
    following: 145,
    totalPitches: 2,
    website: "https://greenchain.io",
    pitches: [
      MOCK_PITCHES[1],
      {
        ...MOCK_PITCHES[1],
        _id: "v_2_2",
        title: "How we built our auditor network",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=400&h=600&fit=crop",
        views: 4300,
        likes: Array(280).fill("x"),
      },
    ],
  },
  f_3: {
    bio: "Adaptive AI tutors that meet every kid where they are.",
    location: "Hyderabad, India",
    followers: 540,
    following: 210,
    totalPitches: 1,
    website: "https://eduforge.in",
    pitches: [MOCK_PITCHES[2]],
  },
  f_4: {
    bio: "Real-time supply chain for Indian SMBs.",
    location: "Delhi NCR, India",
    followers: 1820,
    following: 95,
    totalPitches: 3,
    website: "https://supplysync.com",
    pitches: [
      MOCK_PITCHES[3],
      {
        ...MOCK_PITCHES[3],
        _id: "v_4_2",
        title: "Logistics use case — Pune dairy",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=600&fit=crop",
        views: 2700,
        likes: Array(190).fill("x"),
      },
      {
        ...MOCK_PITCHES[3],
        _id: "v_4_3",
        title: "Onboarding a new SMB in 5 min",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&h=600&fit=crop",
        views: 1900,
        likes: Array(140).fill("x"),
      },
    ],
  },
  f_5: {
    bio: "Soil health AI for smallholder farmers.",
    location: "Pune, India",
    followers: 980,
    following: 67,
    totalPitches: 1,
    website: "https://farmpulse.app",
    pitches: [MOCK_PITCHES[4]],
  },
};
