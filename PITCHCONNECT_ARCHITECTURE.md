# PitchConnect — Complete Architecture & Feature Blueprint

> "Shark Tank meets TikTok" — A platform where Founders pitch in 60–120s videos and Investors discover, connect, and invest.

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Tech Stack](#2-tech-stack)
3. [Free Tier Budget Plan](#3-free-tier-budget-plan)
4. [Architecture — Modular Monolith](#4-architecture--modular-monolith)
5. [Complete Folder Structure](#5-complete-folder-structure)
6. [MongoDB Schema — All Collections](#6-mongodb-schema--all-collections)
7. [All API Routes](#7-all-api-routes)
8. [Verification System](#8-verification-system)
9. [Security — Complete Checklist](#9-security--complete-checklist)
10. [Video Upload & Streaming](#10-video-upload--streaming)
11. [Investor Feed — Instagram/TikTok Style](#11-investor-feed--instagramtiktok-style)
12. [Socket.io — Chat & Signaling Events](#12-socketio--chat--signaling-events)
13. [Video & Audio Calls — Raw WebRTC](#13-video--audio-calls--raw-webrtc)
14. [Push Notifications](#14-push-notifications)
15. [Investment Module](#15-investment-module)
16. [Admin Panel](#16-admin-panel)
17. [React.js Web Structure](#17-reactjs-web-structure)
18. [React Native Mobile Structure](#18-react-native-mobile-structure)
19. [Web + App Cross Connection](#19-web--app-cross-connection)
20. [Redis Caching Strategy](#20-redis-caching-strategy)
21. [Extra Features](#21-extra-features)
22. [Deployment Map](#22-deployment-map)
23. [Build Order — Week by Week](#23-build-order--week-by-week)
24. [Common Mistakes to Avoid](#24-common-mistakes-to-avoid)

---

## 1. Product Overview

| Actor        | Core Actions                                                                                           |
| ------------ | ------------------------------------------------------------------------------------------------------ |
| **Founder**  | Register → Verify → Upload 60–120s pitch video → Get discovered → Chat → Audio/Video call → Close deal |
| **Investor** | Register → Verify → Scroll feed → Like/Save → Mutual match → Chat → Audio/Video call → Invest          |

### Key Differentiators

- TikTok-style vertical video feed for investors
- Mutual match before chat unlocks (reduces spam)
- Verified badges for both roles
- Full communication stack: chat → audio call → video call
- Investment flow with payment integration
- Founder pitch analytics (views, watch time, drop-off)

---

## 2. Tech Stack

### Chosen Stack

| Purpose            | Tool                   | Why                             |
| ------------------ | ---------------------- | ------------------------------- |
| Frontend Web       | React.js               | Fast, component-based           |
| Mobile App         | React Native           | Code share with web logic       |
| Backend            | Node.js + Express.js   | Fast, JS everywhere             |
| Database           | MongoDB Atlas          | Flexible schema, free tier      |
| Realtime           | Socket.io              | Chat + WebRTC signaling         |
| Video Calls        | Raw WebRTC             | Free forever, no vendor lock-in |
| STUN               | Google STUN (free)     | Peer discovery                  |
| TURN               | Metered.ca (free tier) | Relay for bad networks          |
| Video Storage      | Cloudinary             | Auto HLS, free 25GB             |
| Cache + Queue      | Upstash Redis          | Free 10k req/day                |
| Push Notifications | Firebase FCM           | Free unlimited                  |
| Email              | Resend.com             | Free 3k/month                   |
| Payments           | Razorpay               | No monthly fee                  |
| Web Hosting        | Vercel                 | Free forever                    |
| Backend Hosting    | Railway.app            | Free $5 credit                  |

### Why Raw WebRTC over Agora.io

| Factor                | Agora                  | Raw WebRTC        |
| --------------------- | ---------------------- | ----------------- |
| Cost                  | 10k min free then paid | Free forever      |
| Vendor lock-in        | Yes                    | None              |
| Minute limits         | Yes (10k/month)        | None              |
| TURN server           | Included               | Metered.ca (free) |
| You own the code      | No                     | Yes               |
| Works on bad networks | Yes                    | Yes (with TURN)   |

**Decision: Raw WebRTC + Google STUN + Metered.ca TURN = 100% free, full control**

---

## 3. Free Tier Budget Plan

| Service         | Free Limit           | When You'll Hit It        |
| --------------- | -------------------- | ------------------------- |
| Cloudinary      | 25GB bandwidth/month | ~500 video views/day      |
| MongoDB Atlas   | 512MB storage        | ~2000 users with messages |
| Upstash Redis   | 10,000 req/day       | ~300 DAU                  |
| Metered.ca TURN | 0.5GB relay/month    | ~50 video calls/month     |
| Resend.com      | 3,000 emails/month   | ~100 new users/day        |
| Firebase FCM    | Unlimited            | Never                     |
| Vercel          | Unlimited            | Never                     |
| Railway.app     | $5 credit            | ~1 month backend          |
| Razorpay        | No monthly fee       | Per transaction only      |
| Google STUN     | Unlimited            | Never                     |

### Cheapest Upgrades When Free Runs Out

| Service               | Cost                                    |
| --------------------- | --------------------------------------- |
| Railway Hobby         | $5/month                                |
| MongoDB M2            | $9/month                                |
| Upstash Pay-as-you-go | $0.20 per 100k requests                 |
| Metered.ca TURN       | $0.40/GB after free                     |
| Cloudinary Starter    | $89/month (you'll have revenue by then) |

---

## 4. Architecture — Modular Monolith

**Why NOT Microservices:**

- You are 1 developer
- Each service needs its own server = costs money
- 80% time managing infra, 20% building
- Debugging across 5 services is painful
- Railway free plan gets eaten by multiple services

**Why Modular Monolith:**

- One server, one deploy, one codebase
- Internally organized like microservices (easy to split later)
- Used by Shopify, Stack Overflow at massive scale
- Split individual modules out when you hit 10k+ users

```
[ React.js Web ]  ──┐
                     ├──→  [ Node.js + Express — Single Server ]  ──→  [ MongoDB Atlas ]
[ React Native ]  ──┘              │                                         │
                                   ├──→  [ Cloudinary ]              [ Upstash Redis ]
                                   ├──→  [ Socket.io ]
                                   ├──→  [ Firebase FCM ]
                                   └──→  [ Razorpay ]
```

### When to Split to Microservices

- 10,000+ active users
- Team of 4+ developers
- Video module causing performance issues
- Budget available for proper infra

---

## 5. Complete Folder Structure

```
pitchconnect/
│
├── server/                          # Backend — Node.js + Express
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                # MongoDB Atlas connection
│   │   │   ├── redis.js             # Upstash Redis connection
│   │   │   ├── cloudinary.js        # Cloudinary config
│   │   │   └── firebase.js          # FCM push notifications
│   │   │
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── auth.routes.js
│   │   │   │   ├── auth.controller.js
│   │   │   │   ├── auth.service.js
│   │   │   │   ├── auth.model.js
│   │   │   │   └── auth.validation.js   # Joi validation
│   │   │   │
│   │   │   ├── user/
│   │   │   │   ├── user.routes.js
│   │   │   │   ├── user.controller.js
│   │   │   │   ├── user.service.js
│   │   │   │   └── user.model.js
│   │   │   │
│   │   │   ├── video/
│   │   │   │   ├── video.routes.js
│   │   │   │   ├── video.controller.js
│   │   │   │   ├── video.service.js
│   │   │   │   └── video.model.js
│   │   │   │
│   │   │   ├── chat/
│   │   │   │   ├── chat.routes.js
│   │   │   │   ├── chat.controller.js
│   │   │   │   ├── chat.service.js
│   │   │   │   └── chat.model.js
│   │   │   │
│   │   │   ├── call/
│   │   │   │   ├── call.routes.js
│   │   │   │   ├── call.controller.js
│   │   │   │   ├── call.service.js
│   │   │   │   └── call.model.js
│   │   │   │
│   │   │   ├── investment/
│   │   │   │   ├── investment.routes.js
│   │   │   │   ├── investment.controller.js
│   │   │   │   ├── investment.service.js
│   │   │   │   └── investment.model.js
│   │   │   │
│   │   │   ├── notification/
│   │   │   │   ├── notification.routes.js
│   │   │   │   ├── notification.controller.js
│   │   │   │   ├── notification.service.js
│   │   │   │   └── notification.model.js
│   │   │   │
│   │   │   └── admin/
│   │   │       ├── admin.routes.js
│   │   │       ├── admin.controller.js
│   │   │       └── admin.service.js
│   │   │
│   │   ├── socket/
│   │   │   ├── index.js             # Socket.io init + auth handshake
│   │   │   ├── chat.socket.js       # Chat events
│   │   │   └── call.socket.js       # WebRTC signaling events
│   │   │
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js   # JWT verify
│   │   │   ├── role.middleware.js   # founder | investor | admin
│   │   │   ├── upload.middleware.js # Multer config
│   │   │   ├── rateLimit.middleware.js
│   │   │   └── error.middleware.js  # Global error handler
│   │   │
│   │   ├── utils/
│   │   │   ├── asyncHandler.js      # try/catch wrapper
│   │   │   ├── ApiResponse.js       # Standard response format
│   │   │   ├── ApiError.js          # Custom error class
│   │   │   ├── generateToken.js     # JWT access + refresh
│   │   │   └── sendEmail.js         # Resend.com mailer
│   │   │
│   │   └── app.js                   # Express app setup
│   │
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── server.js                    # HTTP + Socket.io server start
│
├── client-web/                      # React.js → Vercel
│   └── src/
│       ├── pages/
│       │   ├── auth/
│       │   │   ├── Login.jsx
│       │   │   ├── Register.jsx
│       │   │   └── ForgotPassword.jsx
│       │   ├── founder/
│       │   │   ├── Dashboard.jsx
│       │   │   ├── UploadPitch.jsx
│       │   │   ├── MyPitches.jsx
│       │   │   ├── Analytics.jsx
│       │   │   └── Deals.jsx
│       │   ├── investor/
│       │   │   ├── Feed.jsx
│       │   │   ├── SavedPitches.jsx
│       │   │   ├── ChatList.jsx
│       │   │   ├── ChatWindow.jsx
│       │   │   └── Investments.jsx
│       │   └── common/
│       │       ├── Profile.jsx
│       │       ├── Notifications.jsx
│       │       └── Settings.jsx
│       ├── components/
│       │   ├── VideoPlayer.jsx      # HLS player (hls.js)
│       │   ├── VideoCard.jsx        # Feed card
│       │   ├── ChatBubble.jsx
│       │   ├── CallScreen.jsx       # WebRTC UI
│       │   ├── IncomingCall.jsx     # Incoming call overlay
│       │   ├── Navbar.jsx
│       │   ├── VerificationBadge.jsx
│       │   └── Loader.jsx
│       ├── hooks/
│       │   ├── useSocket.js
│       │   ├── useWebRTC.js         # Raw WebRTC hook
│       │   ├── useVideoFeed.js      # Infinite scroll + preload
│       │   └── useAuth.js
│       ├── context/
│       │   ├── AuthContext.jsx
│       │   └── SocketContext.jsx
│       ├── services/
│       │   └── api.js               # Axios instance → hits backend
│       └── utils/
│           ├── constants.js
│           └── helpers.js
│
└── client-mobile/                   # React Native
    └── src/
        ├── screens/                 # mirrors web pages
        ├── components/              # mirrors web components
        ├── hooks/                   # same hooks adapted for RN
        ├── navigation/
        │   ├── AppNavigator.js
        │   ├── FounderStack.js
        │   └── InvestorStack.js
        ├── services/
        │   └── api.js
        └── utils/
```

---

## 6. MongoDB Schema — All Collections

### Users

```javascript
{
  _id,
  name: String,
  email: { type: String, unique: true },
  password: String,                    // bcrypt hashed
  role: { type: String, enum: ['founder', 'investor', 'admin'] },
  avatar: String,                      // Cloudinary URL
  phone: String,
  bio: String,
  isEmailVerified: Boolean,
  isPhoneVerified: Boolean,
  verificationLevel: { type: Number, default: 0 },  // 0,1,2,3
  isVerified: Boolean,                 // true = blue tick (level 3)
  verifiedAt: Date,

  // Founder only
  companyName: String,
  industry: String,
  fundingStage: { type: String, enum: ['idea','pre-seed','seed','series-a','series-b'] },
  pitchDeck: String,                   // Cloudinary PDF URL
  website: String,
  linkedIn: String,
  profileCompleteness: Number,         // 0-100%
  totalPitchViews: Number,
  activePitchId: ObjectId,             // only 1 active pitch

  // Investor only
  investmentRange: { min: Number, max: Number },
  preferredIndustries: [String],
  preferredStages: [String],
  totalInvested: Number,
  portfolioCompanies: [String],
  investmentThesis: String,
  linkedIn: String,

  // Documents
  documents: {
    panCard: String,
    aadhar: String,
    businessReg: String,
    status: { type: String, enum: ['none','pending','approved','rejected'] },
    rejectionReason: String,
    submittedAt: Date,
    reviewedAt: Date
  },

  // Auth
  refreshToken: String,
  fcmToken: String,                    // Firebase push token
  loginAttempts: { type: Number, default: 0 },
  lockUntil: Date,
  lastSeen: Date,
  isOnline: Boolean,
  isActive: { type: Boolean, default: true },
  isBanned: Boolean,
  banReason: String,

  createdAt, updatedAt
}
```

### Videos

```javascript
{
  _id,
  founderId: ObjectId,                 // ref: Users
  title: String,
  description: String,
  videoUrl: String,                    // Cloudinary HLS URL (.m3u8)
  thumbnailUrl: String,                // Cloudinary auto-generated
  duration: Number,                    // seconds (60–120 enforced)
  industry: String,
  fundingStage: String,
  askAmount: Number,                   // how much they want (INR)
  equityOffered: Number,               // % equity
  views: { type: Number, default: 0 },
  uniqueViews: [ObjectId],             // investorIds who watched
  watchTimeData: [{                    // for analytics
    investorId: ObjectId,
    watchedSeconds: Number,
    completedAt: Date
  }],
  likes: [ObjectId],                   // investorIds
  saves: [ObjectId],                   // investorIds
  notInterested: [ObjectId],           // investorIds who skipped
  status: { type: String, enum: ['processing','active','paused','expired','rejected'] },
  rejectionReason: String,
  expiresAt: Date,                     // 30 days from upload
  isRenewed: Boolean,
  reportCount: { type: Number, default: 0 },
  isBoosted: Boolean,                  // admin can boost
  boostedUntil: Date,
  cloudinaryPublicId: String,          // for deletion
  createdAt, updatedAt
}
```

### Chats (Rooms)

```javascript
{
  _id,
  participants: [ObjectId],            // [founderId, investorId]
  founderId: ObjectId,
  investorId: ObjectId,
  lastMessage: String,
  lastMessageAt: Date,
  unreadCount: {
    founder: { type: Number, default: 0 },
    investor: { type: Number, default: 0 }
  },
  isActive: { type: Boolean, default: true },
  createdAt
}
```

### Messages

```javascript
{
  _id,
  chatId: ObjectId,                    // ref: Chats
  senderId: ObjectId,
  text: String,
  type: { type: String, enum: ['text','image','file','system'] },
  fileUrl: String,
  isRead: { type: Boolean, default: false },
  readAt: Date,
  isDeleted: { type: Boolean, default: false },
  createdAt
}
```

### Calls

```javascript
{
  _id,
  callerId: ObjectId,                  // investor
  receiverId: ObjectId,                // founder
  chatId: ObjectId,
  type: { type: String, enum: ['audio','video'] },
  status: { type: String, enum: ['initiated','ringing','accepted','declined','ended','missed','no_answer'] },
  channelName: String,                 // unique per call
  startedAt: Date,
  answeredAt: Date,
  endedAt: Date,
  duration: Number,                    // seconds
  endedBy: ObjectId,
  createdAt
}
```

### Investments

```javascript
{
  _id,
  founderId: ObjectId,
  investorId: ObjectId,
  videoId: ObjectId,
  amount: Number,                      // INR
  equity: Number,                      // %
  stage: { type: String, enum: ['interested','negotiating','agreed','completed'] },
  terms: String,
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  status: { type: String, enum: ['pending','paid','failed','refunded'] },
  paidAt: Date,
  createdAt, updatedAt
}
```

### Notifications

```javascript
{
  _id,
  userId: ObjectId,
  type: { type: String, enum: ['like','save','message','call','missed_call','investment','match','system','verification'] },
  title: String,
  body: String,
  data: {},                            // extra payload (callId, chatId, etc.)
  isRead: { type: Boolean, default: false },
  readAt: Date,
  createdAt
}
```

### Reports

```javascript
{
  _id,
  reportedBy: ObjectId,
  reportedUser: ObjectId,
  reportedVideo: ObjectId,
  type: { type: String, enum: ['spam','fake','inappropriate','scam','other'] },
  description: String,
  status: { type: String, enum: ['pending','reviewed','resolved','dismissed'] },
  reviewedBy: ObjectId,                // admin
  reviewedAt: Date,
  createdAt
}
```

### MongoDB Indexes (Add from Day 1)

```javascript
// Users
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ verificationLevel: 1 });

// Videos
db.videos.createIndex({ founderId: 1 });
db.videos.createIndex({ status: 1, createdAt: -1 });
db.videos.createIndex({ industry: 1, fundingStage: 1 });
db.videos.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Messages
db.messages.createIndex({ chatId: 1, createdAt: -1 });

// Notifications
db.notifications.createIndex({ userId: 1, isRead: 1, createdAt: -1 });

// Calls
db.calls.createIndex({ callerId: 1, createdAt: -1 });
db.calls.createIndex({ receiverId: 1, createdAt: -1 });
```

---

## 7. All API Routes

### Auth

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh-token
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
POST   /api/auth/verify-email
POST   /api/auth/send-email-otp
POST   /api/auth/verify-email-otp
POST   /api/auth/send-phone-otp
POST   /api/auth/verify-phone-otp
```

### User

```
GET    /api/user/profile
PUT    /api/user/profile
POST   /api/user/avatar
DELETE /api/user/account
PUT    /api/user/fcm-token
POST   /api/user/documents          # upload KYC docs
GET    /api/user/verification-status
GET    /api/user/:userId/public     # public profile view
```

### Video

```
POST   /api/video/upload            # founder only, level 2+
GET    /api/video/feed              # investor only, paginated
GET    /api/video/:id
DELETE /api/video/:id
PUT    /api/video/:id               # edit title/desc/ask only
POST   /api/video/:id/like
POST   /api/video/:id/save
POST   /api/video/:id/not-interested
POST   /api/video/:id/view          # log view + watch time
POST   /api/video/:id/report
GET    /api/video/my-pitches        # founder sees own
GET    /api/video/saved             # investor sees saved
GET    /api/video/:id/analytics     # founder only
POST   /api/video/:id/renew         # extend 30 day expiry
```

### Chat

```
POST   /api/chat/start              # investor starts (needs mutual like)
GET    /api/chat/list
GET    /api/chat/:chatId/messages
DELETE /api/chat/:chatId
POST   /api/chat/:chatId/report
```

### Call

```
POST   /api/call/initiate           # investor initiates
PUT    /api/call/:callId/accept
PUT    /api/call/:callId/decline
PUT    /api/call/:callId/end
GET    /api/call/history
GET    /api/call/:callId
```

### Investment

```
POST   /api/investment/express-interest
PUT    /api/investment/:id/stage    # update negotiation stage
POST   /api/investment/:id/pay      # Razorpay order create
POST   /api/investment/verify-payment  # Razorpay webhook
GET    /api/investment/my-deals
GET    /api/investment/:id
```

### Notification

```
GET    /api/notification/list
PUT    /api/notification/:id/read
PUT    /api/notification/read-all
DELETE /api/notification/:id
```

### Admin

```
GET    /api/admin/dashboard         # stats overview
GET    /api/admin/users             # all users, filterable
PUT    /api/admin/users/:id/ban
PUT    /api/admin/users/:id/unban
GET    /api/admin/videos/pending    # videos awaiting review
PUT    /api/admin/videos/:id/approve
PUT    /api/admin/videos/:id/reject
GET    /api/admin/documents/pending # KYC queue
PUT    /api/admin/documents/:userId/approve
PUT    /api/admin/documents/:userId/reject
GET    /api/admin/reports           # reported content queue
PUT    /api/admin/reports/:id/resolve
POST   /api/admin/video/:id/boost   # boost a pitch
```

---

## 8. Verification System

### Founder — 3 Levels

| Level | What's Verified           | What's Unlocked            |
| ----- | ------------------------- | -------------------------- |
| 0     | Nothing                   | Browse only                |
| 1     | Email OTP                 | Can view full profiles     |
| 2     | Phone OTP                 | Can upload pitch video     |
| 3     | PAN/Aadhar + Business Reg | Blue tick, investment flow |

### Investor — 3 Levels

| Level | What's Verified        | What's Unlocked             |
| ----- | ---------------------- | --------------------------- |
| 0     | Nothing                | Browse only                 |
| 1     | Email OTP              | Can scroll feed, like, save |
| 2     | Phone OTP              | Can chat, audio/video call  |
| 3     | PAN + Self-declaration | Can initiate investment     |

### Verification Flow

```
1. User registers → Level 0
2. Email OTP sent via Resend.com → verified → Level 1
3. Phone OTP sent via MSG91/Twilio → verified → Level 2
4. User uploads documents (Cloudinary) → status: "pending"
5. Admin reviews in admin panel → approve/reject
6. On approve → Level 3 + isVerified: true + blue tick shown
7. On reject → email sent with reason, user can resubmit
```

### Free Tools for Verification

```
Email OTP  → Resend.com (free 3k/month)
Phone OTP  → MSG91 (India, cheapest) or Twilio free trial
Documents  → Cloudinary (store images, free tier)
Review     → Manual admin panel (you review)
```

---

## 9. Security — Complete Checklist

### Auth Security

```
✅ Access token — 15 min expiry
✅ Refresh token — 7 days, stored in httpOnly cookie (NOT localStorage)
✅ Refresh token rotation — new token on every use
✅ Token blacklist in Redis on logout
✅ Max 5 login attempts → 15 min lockout (tracked in Redis)
✅ Password: bcrypt with salt rounds 12
✅ Email enumeration prevention (same response for wrong email/password)
```

### API Security Packages

```javascript
helmet(); // secure HTTP headers
cors({ origin: whitelist }); // only your domains
express - rate - limit; // 100 req/15min globally
// 5 req/15min on auth routes
express - mongo - sanitize; // prevent NoSQL injection
xss - clean; // sanitize all inputs
hpp; // prevent HTTP param pollution
compression; // gzip responses
```

### Video Security

```
✅ Signed Cloudinary URLs — expire after 1 hour
✅ Server-side duration check with ffprobe (not just frontend)
✅ File type whitelist: mp4, mov, webm only
✅ Max file size: 200MB at Multer level
✅ Max 1 active pitch per founder (enforced in service)
✅ Max 3 total pitches per founder (prevents spam)
```

### Chat & Call Security

```
✅ Socket.io auth handshake — verify JWT on connection
✅ Users can only join rooms they are participants of
✅ Validate chatId ownership on every message event
✅ Message content sanitized before saving
✅ Call only allowed if chat exists between users
✅ Both users must be Level 2+ verified to call
✅ Can't call if either user is already in a call
✅ Call auto-ends if not answered in 30 seconds
```

### Investment Security

```
✅ Razorpay webhook signature verification
✅ Never trust frontend payment confirmation
✅ Investment only after both users are Level 3 verified
✅ All investment state changes logged with timestamp + userId
✅ Idempotency check — prevent duplicate payment processing
```

### Middleware Flow (Every Request)

```
Request
  ↓
rateLimiter         (100 req/15min per IP)
  ↓
helmet + cors + sanitize
  ↓
auth.middleware      (verify JWT)
  ↓
role.middleware      (founder | investor | admin check)
  ↓
Controller
  ↓
Service (business logic)
  ↓
MongoDB / Redis / Cloudinary
  ↓
ApiResponse({ success, data, message })
  ↓
Response
```

---

## 10. Video Upload & Streaming

### How Instagram/TikTok Video Works (You Replicate This)

```
1. Video stored as HLS (HTTP Live Streaming)
   → splits video into 2-3 second chunks (.ts files)
   → loads chunk by chunk, not the whole file at once

2. Thumbnail shown instantly while first chunk loads

3. Next video preloaded in background while current plays

4. CDN serves chunks from nearest server to user

5. Adaptive bitrate — quality adjusts to network speed
```

### Upload Flow

```
1. Founder selects video (60–120s validated on client)
2. POST /api/video/upload hits server
3. Multer receives file (temp storage)
4. FFprobe checks actual duration server-side
5. File type + size validated
6. Upload to Cloudinary (auto HLS + thumbnail)
7. Video status set to "processing"
8. Cloudinary webhook fires when ready → status: "active"
9. Save video doc in MongoDB
10. Invalidate Redis feed cache
11. Notify founder via Socket.io + FCM
```

### Cloudinary Upload Config

```javascript
cloudinary.uploader.upload(filePath, {
  resource_type: "video",
  folder: "pitches",
  transformation: [
    { streaming_profile: "hd", format: "m3u8" }, // HLS free
  ],
  eager_async: true,
  eager_notification_url: process.env.CLOUDINARY_WEBHOOK_URL,
});
```

### Video Player (Web — hls.js)

```javascript
// VideoPlayer.jsx
import Hls from "hls.js";

useEffect(() => {
  if (Hls.isSupported()) {
    const hls = new Hls();
    hls.loadSource(videoUrl); // .m3u8 URL
    hls.attachMedia(videoRef.current);
  } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
    videoRef.current.src = videoUrl; // Safari native HLS
  }
}, [videoUrl]);
```

### Video Player (React Native)

```javascript
// react-native-video supports HLS natively
<Video
  source={{ uri: videoUrl }} // .m3u8 URL
  resizeMode="cover"
  repeat={false}
  paused={!isVisible}
/>
```

---

## 11. Investor Feed — Instagram/TikTok Style

### Feed Algorithm

```
Priority order:
1. Boosted pitches (admin boosted)
2. New pitches (< 48 hours old) — new post boost
3. Matching investor preferences (industry + stage + amount range)
4. Trending (most liked in last 7 days)
5. Everything else (chronological)

Excluded from feed:
- Videos investor already liked
- Videos investor marked "not interested"
- Expired videos
- Processing/rejected videos
- Own company (if investor is also a founder)
```

### Pagination — Cursor Based

```javascript
// NOT page numbers — breaks with real-time data
// Use cursor (last video ID seen)

GET /api/video/feed?cursor=lastVideoId&limit=5

// Response
{
  videos: [...],
  nextCursor: "lastVideoIdInThisBatch",
  hasMore: true
}
```

### Preloading Strategy

```javascript
const FEED_WINDOW = 10; // max videos in DOM/memory
const PREFETCH_AT = 3; // fetch more when at index 3
const PAGE_SIZE = 5; // fetch 5 at a time

// When user reaches video index 3 → fetch next 5
// Keep max 10 in memory → remove oldest when adding new
// Prevents memory buildup on mobile
```

### Intersection Observer (Web — Auto Play/Pause)

```javascript
// Video only plays when 80% visible in viewport
const observer = new IntersectionObserver(
  ([entry]) =>
    entry.intersectionRatio > 0.8
      ? videoRef.current.play()
      : videoRef.current.pause(),
  { threshold: 0.8 },
);
```

### React Native FlatList Optimization

```javascript
<FlatList
  data={videos}
  pagingEnabled // snap to each video
  removeClippedSubviews // remove off-screen from memory
  maxToRenderPerBatch={3}
  windowSize={5} // render 5 videos around current
  initialNumToRender={2}
  getItemLayout={(_, index) => ({
    length: SCREEN_HEIGHT,
    offset: SCREEN_HEIGHT * index,
    index,
  })}
/>
```

---

## 12. Socket.io — Chat & Signaling Events

### Socket Auth Handshake

```javascript
// Client sends JWT on connection
const socket = io(SERVER_URL, {
  auth: { token: accessToken },
});

// Server verifies on connection
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  socket.userId = decoded._id;
  socket.userName = decoded.name;
  socket.userAvatar = decoded.avatar;
  next();
});

// Join personal room on connect
socket.join(socket.userId);
```

### Chat Events

```javascript
// ─── CLIENT EMITS ───────────────────────────────
socket.emit("join_chat", { chatId });
socket.emit("send_message", { chatId, text, type });
socket.emit("typing", { chatId });
socket.emit("stop_typing", { chatId });
socket.emit("mark_read", { chatId });

// ─── SERVER EMITS ───────────────────────────────
socket.to(roomId).emit("new_message", { message });
socket.to(roomId).emit("user_typing", { userId });
socket.to(roomId).emit("user_stop_typing", { userId });
socket.to(roomId).emit("messages_read", { chatId, userId });
io.to(userId).emit("online_status", { userId, isOnline });
```

### Call Signaling Events (WebRTC)

```javascript
// ─── CLIENT EMITS ───────────────────────────────
socket.emit("call_initiate", { receiverId, type, channelName });
socket.emit("call_accept", { callId });
socket.emit("call_decline", { callId });
socket.emit("call_end", { callId });
socket.emit("webrtc_offer", { targetId, offer });
socket.emit("webrtc_answer", { targetId, answer });
socket.emit("ice_candidate", { targetId, candidate });

// ─── SERVER EMITS ───────────────────────────────
io.to(receiverId).emit("incoming_call", {
  callId,
  callerId,
  callerName,
  callerAvatar,
  type,
  channelName,
});
io.to(callerId).emit("call_accepted", { callId });
io.to(callerId).emit("call_declined", { callId });
io.to(otherId).emit("call_ended", { callId, duration });
io.to(targetId).emit("webrtc_offer", { from, offer });
io.to(targetId).emit("webrtc_answer", { from, answer });
io.to(targetId).emit("ice_candidate", { from, candidate });
```

### Online Status Tracking

```javascript
// On connect
await redis.set(`online:${socket.userId}`, 1, "EX", 30);
io.emit("online_status", { userId: socket.userId, isOnline: true });

// Heartbeat — client pings every 20s
socket.on("heartbeat", async () => {
  await redis.set(`online:${socket.userId}`, 1, "EX", 30);
});

// On disconnect
await redis.del(`online:${socket.userId}`);
io.emit("online_status", { userId: socket.userId, isOnline: false });
```

---

## 13. Video & Audio Calls — Raw WebRTC

### Why Raw WebRTC (Not Agora)

```
✅ Free forever — no minute limits
✅ No vendor lock-in
✅ You own the code
✅ Google STUN = free peer discovery
✅ Metered.ca TURN = free relay for bad networks
```

### ICE Server Config

```javascript
const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    {
      urls: "turn:standard.relay.metered.ca:80",
      username: process.env.METERED_USERNAME,
      credential: process.env.METERED_CREDENTIAL,
    },
    {
      urls: "turn:standard.relay.metered.ca:443",
      username: process.env.METERED_USERNAME,
      credential: process.env.METERED_CREDENTIAL,
    },
  ],
};
```

### Call Flow

```
Investor clicks "Call"
  ↓
POST /api/call/initiate → creates Call doc (status: ringing)
  ↓
Socket: "call_initiate" → founder receives "incoming_call"
  ↓
Founder sees incoming call screen (30s timeout → missed)
  ↓
Founder accepts → Socket: "call_accept"
  ↓
Investor receives "call_accepted" → creates RTCPeerConnection
  ↓
Investor creates SDP offer → Socket: "webrtc_offer" → Founder
  ↓
Founder creates SDP answer → Socket: "webrtc_answer" → Investor
  ↓
Both exchange ICE candidates → Socket: "ice_candidate"
  ↓
Direct P2P connection established (TURN relay if P2P fails)
  ↓
Either side ends → Socket: "call_end" → save duration to DB
```

### Call Rules

```
✅ Only investors can initiate calls
✅ Chat must exist between them first
✅ Both must be Level 2+ verified
✅ Neither can be in an active call already
✅ Auto-miss after 30 seconds if not answered
✅ Call token/channel is unique per call (UUID)
✅ Duration calculated from answeredAt to endedAt
```

### Call Controls (Both Web + Mobile)

```
Mute/Unmute microphone
Camera on/off (video calls)
Switch camera front/back (mobile)
Speaker on/off (mobile)
End call
Call duration timer
Remote user name + avatar shown
```

### Incoming Call When App is Background (FCM)

```javascript
// Send high-priority FCM push when receiver is offline
await admin.messaging().send({
  token: receiverFcmToken,
  android: { priority: "high" },
  apns: { payload: { aps: { sound: "ringtone.caf" } } },
  data: {
    type: "incoming_call",
    callId,
    channelName,
    callerName,
    callType,
  },
});
```

---

## 14. Push Notifications

### Notification Types

```
like           → "Investor X liked your pitch"
save           → "Investor X saved your pitch"
match          → "You have a new match! Start chatting"
message        → "New message from X"
call           → "X is calling you"
missed_call    → "You missed a call from X"
investment     → "X expressed interest in investing"
verification   → "Your documents have been approved/rejected"
system         → Platform announcements
pitch_expiry   → "Your pitch expires in 3 days"
pitch_views    → "5 investors viewed your pitch today" (daily digest)
```

### Notification Service (Handles All Platforms)

```javascript
const sendNotification = async (userId, data) => {
  // 1. In-app via Socket.io (both web + mobile, if online)
  io.to(userId.toString()).emit("notification", data);

  // 2. Push via FCM (mobile, if app is background/closed)
  const user = await User.findById(userId).select("fcmToken");
  if (user.fcmToken) await sendFCM(user.fcmToken, data);

  // 3. Save to DB (notification bell, both platforms)
  await Notification.create({ userId, ...data });
};
```

### Weekly Email Digest (Resend.com)

```
Every Monday → investors get:
"5 new pitches in your preferred industries this week"

Every Monday → founders get:
"Your pitch got X views this week. Y investors saved it."
```

---

## 15. Investment Module

### Investment Stages

```
interested    → Investor clicks "I'm Interested"
negotiating   → Both agree to discuss terms
agreed        → Terms finalized, ready to pay
completed     → Payment done via Razorpay
```

### Investment Flow

```
1. Investor clicks "Express Interest" on pitch
2. Investment doc created (stage: interested)
3. Founder notified
4. Both negotiate in chat
5. Investor updates stage to "negotiating" → "agreed"
6. Investor initiates payment → POST /api/investment/:id/pay
7. Razorpay order created → frontend opens Razorpay checkout
8. Payment done → Razorpay webhook fires
9. Backend verifies signature → status: "paid"
10. Both notified → deal marked completed
```

### Razorpay Webhook Verification

```javascript
const crypto = require("crypto");

const verifyPayment = (orderId, paymentId, signature) => {
  const body = orderId + "|" + paymentId;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");
  return expectedSignature === signature;
};
```

### Investment Rules

```
✅ Both founder and investor must be Level 3 verified
✅ Investor can only invest in active pitches
✅ One investment per investor per pitch
✅ Founder can see all interested investors
✅ Investment amount must be within investor's stated range
✅ All payment events logged for audit trail
```

---

## 16. Admin Panel

### Features

```
Dashboard
  - Total founders / investors
  - Videos uploaded today
  - Active calls right now
  - Revenue (total investments processed)
  - New registrations this week

User Management
  - Search users by name/email/role
  - View full profile
  - Ban / unban with reason
  - View all activity

Video Management
  - Pending review queue
  - Approve / reject with reason
  - Boost a pitch (shows first in feed)
  - Remove a pitch

KYC / Document Review
  - Pending verification queue
  - View uploaded documents
  - Approve → Level 3 granted
  - Reject → email sent with reason

Reports Queue
  - All reported users/videos
  - Mark as resolved / dismissed
  - Take action (ban user, remove video)
```

### Admin Access

```javascript
// Separate admin role in User model
// Protected by role.middleware.js
// Admin created manually in DB (no public signup)
// All admin actions logged with adminId + timestamp
```

---

## 17. React.js Web Structure

### Key Pages

| Page              | Role     | Description                        |
| ----------------- | -------- | ---------------------------------- |
| Login / Register  | Both     | Role selection on signup           |
| Founder Dashboard | Founder  | Stats, active pitch, quick actions |
| Upload Pitch      | Founder  | Video upload with preview          |
| My Pitches        | Founder  | All pitches + analytics            |
| Pitch Analytics   | Founder  | Views, watch time, likes, saves    |
| Deals             | Founder  | All investment conversations       |
| Feed              | Investor | TikTok-style vertical scroll       |
| Saved Pitches     | Investor | Bookmarked pitches                 |
| Chat List         | Both     | All conversations                  |
| Chat Window       | Both     | Real-time messaging                |
| Call Screen       | Both     | WebRTC audio/video                 |
| Investments       | Investor | Portfolio + deal tracking          |
| Profile           | Both     | Edit profile, verification status  |
| Notifications     | Both     | All notifications                  |
| Settings          | Both     | Account, privacy, preferences      |

### State Management

```
AuthContext    → user data, tokens, role
SocketContext  → socket instance, online status
No Redux needed at V1 — React Context + local state is enough
```

### Key Libraries

```
axios          → API calls
hls.js         → HLS video playback
socket.io-client → realtime
react-router-dom → routing
react-hook-form  → forms
zod              → client-side validation
react-intersection-observer → auto play/pause videos
```

---

## 18. React Native Mobile Structure

### Navigation Structure

```
AppNavigator
  ├── AuthStack (not logged in)
  │   ├── LoginScreen
  │   ├── RegisterScreen
  │   └── ForgotPasswordScreen
  │
  ├── FounderStack (logged in as founder)
  │   ├── DashboardScreen
  │   ├── UploadPitchScreen
  │   ├── MyPitchesScreen
  │   ├── AnalyticsScreen
  │   ├── ChatListScreen
  │   ├── ChatWindowScreen
  │   ├── CallScreen
  │   └── ProfileScreen
  │
  └── InvestorStack (logged in as investor)
      ├── FeedScreen          ← main screen
      ├── SavedPitchesScreen
      ├── ChatListScreen
      ├── ChatWindowScreen
      ├── CallScreen
      ├── InvestmentsScreen
      └── ProfileScreen
```

### Key Libraries (React Native)

```
react-native-video          → HLS video playback
react-native-webrtc         → Raw WebRTC
@react-native-firebase/app  → Firebase base
@react-native-firebase/messaging → FCM push
react-native-razorpay       → Payments
@react-navigation/native    → Navigation
react-native-image-picker   → Video/image picker
react-native-document-picker → Document upload for KYC
```

---

## 19. Web + App Cross Connection

### Shared Backend — One API, Both Platforms

```
React.js (Web)     ──┐
                      ├──→  Node.js API  ──→  MongoDB
React Native (App) ──┘         │
                                └──→  Socket.io (same server)
```

### CORS Setup

```javascript
cors({
  origin: [
    "https://pitchconnect.vercel.app",
    "https://www.pitchconnect.com",
    // React Native doesn't send origin header
    // Handle by checking if origin is undefined
  ],
  credentials: true, // for httpOnly cookies
});
```

### Platform Detection

```javascript
// Client sends platform header
axios.defaults.headers.common["x-platform"] = "web"; // or 'mobile'

// Backend uses it for platform-specific logic
// e.g., cookies for web, bearer token for mobile
```

### Token Strategy

```
Web    → httpOnly cookie (more secure, CSRF protected)
Mobile → Bearer token in Authorization header
         (React Native can't use httpOnly cookies)
```

### Notification Routing

```javascript
const sendNotification = async (userId, data) => {
  io.to(userId).emit("notification", data); // web (if online)
  if (user.fcmToken) sendFCM(user.fcmToken, data); // mobile push
  await Notification.create({ userId, ...data }); // DB (both read)
};
```

---

## 20. Redis Caching Strategy

### What to Cache

```javascript
`feed:${investorId}:${cursor}`    TTL: 5 min   // investor feed
`video:${videoId}`                TTL: 10 min  // single video data
`user:${userId}`                  TTL: 15 min  // profile data
`online:${userId}`                TTL: 30 sec  // online status
`login_attempts:${email}`         TTL: 15 min  // brute force protection
`token_blacklist:${token}`        TTL: 15 min  // logged out tokens
```

### What NOT to Cache

```
Messages        → always fresh from DB
Investment status → always fresh
Notifications   → always fresh
Video view count → use Redis INCR, flush to DB every 5 min
```

### View Count Batching (Saves DB Writes)

```javascript
// Instead of DB write on every view:
await redis.incr(`video:views:${videoId}`);

// Cron job every 5 minutes:
// Read all view counts from Redis → bulk update MongoDB → clear Redis keys
```

---

## 21. Extra Features

### Features Not in Original Plan (Add These)

#### Pitch Expiry + Renewal

```
- Every pitch auto-expires after 30 days (MongoDB TTL index)
- Founder gets notification 3 days before expiry
- Founder can renew with one click (resets 30 day timer)
- Expired pitches hidden from feed but not deleted
- Founder can reactivate anytime
```

#### Pitch Analytics (Founder Dashboard)

```
- Total views (unique + total)
- Average watch time (seconds)
- Drop-off rate (how many watched full video)
- Likes / saves / not-interested ratio
- How many investors started chat
- Views over time (last 7 days chart)
- Industry breakdown of viewers
```

#### Profile Completeness Score

```
- Like LinkedIn — shows % complete
- Pushes founder to fill everything before uploading
- Investors with complete profiles get priority in search
- Incomplete profiles shown with a banner prompt
```

#### Mutual Match System

```
- Investor likes pitch → founder gets notified
- Founder can approve/ignore the like
- Only on mutual approval → chat unlocks
- Reduces spam messages to founders
- Founder can set "Open to connect" toggle on/off
```

#### Not Interested / Hide

```
- Investor clicks "Not Interested" on a pitch
- That pitch never shows in their feed again
- Stored in video.notInterested[] array
- Feed query excludes these video IDs
```

#### Trending Feed Section

```
- Separate "Trending" tab in investor feed
- Algorithm: most liked + saved in last 7 days
- Refreshed every hour via Redis cache
- New pitches (< 48h) get a "New" badge
```

#### Search & Filters

```
Investor can filter feed by:
  - Industry (fintech, healthtech, edtech, etc.)
  - Funding stage (idea, pre-seed, seed, series-a)
  - Ask amount range
  - Location (city/state)
  - Verified founders only toggle

Search:
  - Search founders by name, company, industry
  - Search results show pitch thumbnail + quick stats
```

#### Report & Block System

```
- Report user (spam, fake, inappropriate, scam)
- Report video (same categories)
- Block user → they disappear from feed + can't message
- Auto-hide video if reported by 5+ users (pending admin review)
- All reports go to admin queue
```

#### Re-engagement Notifications

```
- "You haven't checked the feed in 3 days — 12 new pitches waiting"
- "Your pitch got 5 new views today"
- "3 investors saved your pitch this week"
- Weekly digest email every Monday
- Sent via FCM (mobile) + Resend.com (email)
```

#### Founder "Open to Connect" Toggle

```
- Founder can pause incoming connection requests
- Useful when already in active negotiations
- Shows "Not accepting new connections" on profile
- Existing chats still work
```

#### Investor Portfolio Page

```
- All companies invested in
- Total amount invested
- Stage of each deal
- Quick link to chat with each founder
- Export as PDF (V2)
```

#### Profile Views

```
- Founder sees list of investors who viewed their profile
- "3 investors viewed your profile today"
- Investor name + avatar shown (if Level 2+)
- Encourages founders to keep profile updated
```

#### Terms Acceptance Logging

```
- Store timestamp of T&C acceptance on signup
- Store IP address + user agent
- Required for legal compliance
- Especially important before investment flow
```

#### Pitch Deck Upload

```
- Founder can attach PDF pitch deck to their profile
- Investors can request access to pitch deck
- Founder approves/denies access request
- Cloudinary stores PDF, signed URL for access
```

#### Video Watermark (V2)

```
- Auto-watermark founder's company name on video
- Prevents content theft
- Cloudinary supports this via transformation
```

#### Two-Factor Authentication (V2)

```
- Optional 2FA for investors (handling real money)
- TOTP via Google Authenticator
- Backup codes generated on setup
```

#### Referral System (V2)

```
- Founder refers another founder → both get profile boost
- Investor refers another investor → both get extra free calls
- Track referral chain in User model
```

---

## 22. Deployment Map

```
Service              Platform          Cost
─────────────────────────────────────────────
React.js Web      →  Vercel            Free forever
Node.js Backend   →  Railway.app       Free $5 credit → $5/month
MongoDB           →  Atlas Free Tier   Free 512MB → $9/month
Redis             →  Upstash           Free 10k/day → pay-as-you-go
Video             →  Cloudinary        Free 25GB → $89/month
STUN              →  Google            Free forever
TURN              →  Metered.ca        Free 0.5GB → $0.40/GB
Push              →  Firebase FCM      Free forever
Email             →  Resend.com        Free 3k/month → $20/month
Payments          →  Razorpay          No monthly fee
React Native      →  Expo / bare RN    Free to build
```

### Environment Variables (.env.example)

```
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=

# JWT
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_WEBHOOK_URL=

# Upstash Redis
UPSTASH_REDIS_URL=
UPSTASH_REDIS_TOKEN=

# Firebase
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=

# Resend Email
RESEND_API_KEY=

# Razorpay
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# WebRTC TURN (Metered.ca)
METERED_USERNAME=
METERED_CREDENTIAL=

# MSG91 (Phone OTP)
MSG91_AUTH_KEY=
MSG91_TEMPLATE_ID=

# Admin
ADMIN_EMAIL=
ADMIN_PASSWORD=

# CORS
ALLOWED_ORIGINS=https://pitchconnect.vercel.app,https://www.pitchconnect.com
```

---

## 23. Build Order — Week by Week

```
Week 1  → Project setup + MongoDB + Auth module
          (register, login, JWT, email OTP, phone OTP)

Week 2  → User profiles + Document upload (Cloudinary)
          Verification levels 1, 2, 3
          Admin panel — KYC review queue

Week 3  → Video upload + Cloudinary HLS + FFprobe validation
          Video model + Cloudinary webhook

Week 4  → Investor feed + cursor pagination + Redis cache
          Like / Save / Not Interested
          Feed algorithm (boost, trending, personalized)

Week 5  → Socket.io setup + Chat module
          Real-time messaging, typing indicators, read receipts
          Online status tracking

Week 6  → Raw WebRTC calls (audio + video)
          Signaling via Socket.io
          Metered.ca TURN integration
          Incoming call FCM push

Week 7  → Investment module + Razorpay
          Deal stages, payment flow, webhook verification

Week 8  → Notifications (FCM + in-app + email digest)
          Report / Block system
          Admin panel — reports queue

Week 9  → Pitch analytics (founder dashboard)
          Profile completeness score
          Search + filters
          Pitch expiry + renewal

Week 10 → React Native mobile app
          (mirrors web, same API + Socket.io)

Week 11 → Testing (unit + integration + manual)
          Security audit
          Performance testing (load test feed endpoint)

Week 12 → Deploy everything
          Set up monitoring (Railway logs, MongoDB Atlas alerts)
          Soft launch
```

---

## 24. Common Mistakes to Avoid

| Mistake                                        | What to Do Instead                                |
| ---------------------------------------------- | ------------------------------------------------- |
| Storing video in MongoDB                       | Use Cloudinary, store only URL in DB              |
| No video transcoding                           | Always convert to HLS before serving              |
| Using Firebase for chat                        | Socket.io on your own server                      |
| Building WebRTC from scratch without TURN      | Use Metered.ca free TURN                          |
| Trusting frontend payment confirmation         | Always verify Razorpay webhook signature          |
| Storing refresh token in localStorage          | Use httpOnly cookie (web)                         |
| No server-side video duration check            | Use FFprobe on server                             |
| Page-based pagination                          | Use cursor-based pagination                       |
| No MongoDB indexes                             | Index from day 1 (founderId, role, createdAt)     |
| No input validation                            | Use Joi on every API route                        |
| Allowing chat before mutual match              | Enforce mutual like before chat unlocks           |
| No rate limiting on upload                     | Max 3 pitches per founder, rate limit endpoint    |
| Serving raw Cloudinary URLs permanently        | Use signed URLs with expiry                       |
| No error boundary on video player              | Wrap in try/catch, show fallback thumbnail        |
| Skipping refresh token rotation                | Rotate on every use, blacklist old ones           |
| No admin panel                                 | Build simple one from day 1 — you need visibility |
| Microservices at V1                            | Modular monolith — split later when needed        |
| No pitch expiry                                | Add TTL index — stale pitches hurt feed quality   |
| Letting investors message without verification | Enforce Level 2 before chat                       |

---

## Quick Reference — Key Numbers

```
Video duration      → min 60s, max 120s
Active pitches      → max 1 per founder at a time
Total pitches       → max 3 per founder
Pitch expiry        → 30 days (renewable)
Auto-miss call      → 30 seconds
Access token expiry → 15 minutes
Refresh token expiry→ 7 days
Login lockout       → 5 attempts → 15 min lock
Feed page size      → 5 videos per fetch
Feed prefetch at    → index 3
Max videos in memory→ 10
Rate limit global   → 100 req / 15 min per IP
Rate limit auth     → 5 req / 15 min per IP
Max upload size     → 200MB (Multer)
Redis online TTL    → 30 seconds
Redis feed TTL      → 5 minutes
Redis profile TTL   → 15 minutes
```

---

_Last updated: May 2026_
_Stack: React.js + React Native + Node.js + Express + MongoDB + Socket.io + WebRTC + Cloudinary + Redis + Firebase + Razorpay_

---

## 25. v2 — Posts, Follow, Subscription & Boost

> Added after v1 launch planning. These features turn EXPGLO FUND from a one-shot
> fundraising tool into a sticky social platform that earns revenue continuously.

### 25.1 Goals

| Goal                          | Why                                                                                    |
| ----------------------------- | -------------------------------------------------------------------------------------- |
| Add **posts** (image + text)  | Keep founders active between pitches — Instagram/LinkedIn parity                       |
| Founders can **use the feed** | They scroll, follow, comment, message — like investors do (but no "Invest" action)     |
| **Follow** (no mutual match)  | Cleaner UX. Spam blocked by paid subscription, not by manual approval                  |
| **Subscription paywall**      | 2nd revenue stream — locks new DMs and audio/video calls behind ₹499/month             |
| **Boost a pitch**             | 3rd revenue stream — pay-per-boost to push a pitch to top of matching investors' feeds |

### 25.2 Three Revenue Streams

| #   | Stream                      | Status                        |
| --- | --------------------------- | ----------------------------- |
| 1   | **Course sales**            | already in plan, no change    |
| 2   | **EXPGLO Pro subscription** | NEW — ₹499/month              |
| 3   | **Boost-a-pitch**           | NEW — pay-per-boost (3 tiers) |

---

### 25.3 Posts (new content type)

```
type: image-carousel (1–10 images) + caption + optional link + hashtags
      OR plain-text-only post
who:  founders only (v1) — investors might be enabled later
expiry: never (only owner can delete)
limit: 10 posts/day per user
```

#### Post schema

```javascript
{
  _id,
  authorId: ObjectId,                  // ref: Users
  type: { type: String, enum: ['images','text'], default: 'images' },
  images: [String],                    // Cloudinary URLs, max 10
  caption: String,                     // max 2200 chars (Instagram parity)
  link: String,                        // optional external URL
  hashtags: [String],
  likes: [ObjectId],                   // userIds
  saves: [ObjectId],                   // userIds (any role can save)
  commentCount: { type: Number, default: 0 },
  isDeleted: { type: Boolean, default: false },
  createdAt
}
```

#### Post API routes

```
POST   /api/post                       # founder only — create
GET    /api/post/feed                  # mixed into video feed
GET    /api/post/:id
DELETE /api/post/:id                   # owner only
PUT    /api/post/:id                   # owner only — edit caption/link
POST   /api/post/:id/like
POST   /api/post/:id/save
POST   /api/post/:id/report
GET    /api/post/user/:userId          # all posts by a user (for profile grid)
GET    /api/post/saved                 # current user's saved posts
```

---

### 25.4 Follow (replaces mutual-match)

```javascript
// Follow schema
{
  _id,
  followerId: ObjectId,                // ref: Users — who clicked Follow
  followingId: ObjectId,               // ref: Users — who is being followed
  createdAt
}
// Unique compound index: { followerId: 1, followingId: 1 }
// Indexes both ways: { followerId: 1, createdAt: -1 } and { followingId: 1, createdAt: -1 }
```

```
POST   /api/follow/:userId             # follow a user
DELETE /api/follow/:userId             # unfollow
GET    /api/follow/followers/:userId   # paginated list
GET    /api/follow/following/:userId   # paginated list
GET    /api/follow/status/:userId      # { isFollowing, isFollowedBy }
```

#### User schema additions for follow

```javascript
{
  ...existing,
  followersCount: { type: Number, default: 0 },
  followingCount: { type: Number, default: 0 },
  postsCount: { type: Number, default: 0 }
}
```

---

### 25.5 Subscription (EXPGLO Pro — ₹499/month)

#### What free vs Pro gets

| Feature                           | Free            | Pro (₹499/mo)                             |
| --------------------------------- | --------------- | ----------------------------------------- |
| Browse feed (pitches + posts)     | ✅              | ✅                                        |
| Like / save / comment             | ✅              | ✅                                        |
| Follow anyone                     | ✅              | ✅                                        |
| Upload pitches & posts            | ✅              | ✅                                        |
| Receive DMs (incoming)            | ✅              | ✅                                        |
| **Start NEW DMs**                 | 1 free / month  | ✅ unlimited                              |
| **Audio + video calls**           | ❌ blocked      | ✅ unlimited                              |
| Boost a pitch                     | pay-per-boost   | 1 free Mini boost / month + pay-per-boost |
| Investment expression (investors) | ✅              | ✅                                        |
| Profile views (who viewed me)     | last 3 only     | full list                                 |
| Advanced filters in Discover      | basic           | full                                      |
| Course access                     | sold separately | sold separately                           |

#### Subscription schema

```javascript
{
  _id,
  userId: ObjectId,
  plan: { type: String, enum: ['pro'], default: 'pro' },
  status: { type: String, enum: ['active','expired','cancelled','pending'] },
  startedAt: Date,
  expiresAt: Date,                     // renewed monthly
  razorpaySubscriptionId: String,
  razorpayCustomerId: String,
  razorpayPlanId: String,

  // Free-tier counters reset every month
  freeChatsUsedThisMonth: { type: Number, default: 0 },
  freeBoostsUsedThisMonth: { type: Number, default: 0 },
  countersResetAt: Date,

  // Audit
  history: [{
    event: String,                     // 'subscribed','renewed','cancelled','expired'
    amount: Number,
    razorpayPaymentId: String,
    at: Date
  }]
}
```

#### Subscription API routes

```
POST   /api/subscription/create-order  # creates Razorpay subscription
POST   /api/subscription/verify        # verify webhook + activate
POST   /api/subscription/cancel
GET    /api/subscription/me            # current user's status
POST   /api/subscription/use-free-chat # increment freeChatsUsedThisMonth
```

#### Free-chat gate (server-side)

```javascript
// Pseudo-code in chat.service.js
async function startNewChat(senderId, receiverId) {
  // Check existing chat
  const existing = await Chat.findOne({
    participants: { $all: [senderId, receiverId] },
  });
  if (existing) return existing; // legacy chat — always allowed

  const sub = await Subscription.findOne({
    userId: senderId,
    status: "active",
  });
  if (sub) return Chat.create({ participants: [senderId, receiverId] });

  // Free user — check monthly counter
  const sub2 = await Subscription.findOne({ userId: senderId }); // even if expired
  const freeUsed = sub2?.freeChatsUsedThisMonth ?? 0;
  if (freeUsed >= 1) {
    throw new ApiError(
      402,
      "Subscribe to EXPGLO Pro to start more conversations",
    );
  }

  // Allow + increment counter
  await Subscription.updateOne(
    { userId: senderId },
    { $inc: { freeChatsUsedThisMonth: 1 } },
    { upsert: true },
  );
  return Chat.create({ participants: [senderId, receiverId] });
}
```

#### Call gate (server-side + socket-side)

```javascript
// In call.service.js + call.socket.js
async function ensureCanCall(callerId, receiverId) {
  const sub = await Subscription.findOne({
    userId: callerId,
    status: "active",
  });
  if (!sub) {
    throw new ApiError(402, "Audio and video calls are a Pro feature");
  }
  // Existing checks: chat exists, both verified, neither in active call
}
```

#### Mock subscription on frontend

While backend isn't wired yet:

```javascript
// src/lib/auth.js — adds setSubscription / getSubscription helpers
// Stored in localStorage as { plan, status, expiresAt, freeChatsUsedThisMonth }
// Pricing page mock-pay flow flips status to 'active' instantly
// All gates (chat-start, call-start) read this state
```

---

### 25.6 Boost a Pitch (pay-per-boost — 3rd revenue stream)

#### Targeting

```
1. Each investor selects their favourite industries on signup
   (multi-select, e.g. ["Fintech", "HealthTech"])
2. When founder boosts a pitch tagged "Fintech", that pitch
   is pinned at the TOP of the feed for investors with "Fintech"
   in their preferred industries.
3. Each boosted pitch shows ONCE per investor — when they swipe
   past it, the pitch.boostShownTo[] array tracks the investor's
   ID so they don't see the boost slot for it again.
4. The pitch still appears in normal feed rotation later.
5. Founders also see boosted pitches (so peers/collaborators
   can engage too).
```

#### Boost tiers

| Tier | Price (placeholder) | Duration | Reach                                          |
| ---- | ------------------- | -------- | ---------------------------------------------- |
| Mini | ₹499                | 24 hours | Top of feed for matching-industry investors    |
| Pro  | ₹1,499              | 7 days   | Top of feed for matching-industry investors    |
| Mega | ₹4,999              | 30 days  | Top of feed for ALL investors + Featured badge |

#### Boost schema

```javascript
{
  _id,
  pitchId: ObjectId,                   // ref: Videos
  founderId: ObjectId,
  tier: { type: String, enum: ['mini','pro','mega'] },
  amountPaid: Number,                  // INR, gross
  durationHours: Number,
  startedAt: Date,
  expiresAt: Date,
  shownTo: [ObjectId],                 // investorIds who already saw the boost slot
  status: { type: String, enum: ['active','expired','refunded'] },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  createdAt
}
// Index: { status: 1, expiresAt: 1 } for active-boost lookups
// Index: { pitchId: 1 } for "is this pitch boosted?"
```

#### Boost API routes

```
POST   /api/boost/create-order         # creates Razorpay order for tier
POST   /api/boost/verify               # webhook → activate boost
GET    /api/boost/my-boosts            # founder's history
POST   /api/boost/:id/track-shown      # called by feed query when shown to an investor
GET    /api/boost/active               # admin — see all active boosts
```

#### Boost target logic (in feed query)

```javascript
// video.service.js — getFeed()
async function getFeed(investorId, cursor, limit) {
  const investor = await User.findById(investorId).lean();
  const prefs = investor.preferredIndustries || [];

  // Step 1 — pull active boosts the investor hasn't seen yet
  const boostedSlot = await Boost.findOne({
    status: "active",
    expiresAt: { $gt: new Date() },
    shownTo: { $ne: investorId },
  })
    .populate({
      path: "pitchId",
      match: prefs.length ? { industry: { $in: prefs } } : {}, // mega tier matches everything
    })
    .sort("-tier"); // mega first

  let videos = [];
  if (boostedSlot && boostedSlot.pitchId) {
    videos.push(boostedSlot.pitchId);
    await Boost.updateOne(
      { _id: boostedSlot._id },
      { $addToSet: { shownTo: investorId } },
    );
  }

  // Step 2 — fill remaining slots with normal feed query
  const remaining = limit - videos.length;
  const normal = await Video.find({
    status: "active",
    _id: { $nin: [...videos.map((v) => v._id), ...investor.notInterested] },
    ...(cursor ? { _id: { $lt: cursor } } : {}),
  })
    .sort("-createdAt")
    .limit(remaining);

  return { videos: [...videos, ...normal] };
}
```

---

### 25.7 Updated user schema (consolidated additions)

```javascript
{
  ...existing,
  followersCount: Number,
  followingCount: Number,
  postsCount: Number,
  hasActiveSubscription: Boolean,      // denormalized for fast feed checks
  preferredIndustries: [String]        // already exists for investors,
                                       // also collected from founders so
                                       // boost can match peer-discovery
}
```

---

### 25.8 Updated chat schema (drops mutual-match requirement)

```javascript
{
  _id,
  participants: [ObjectId],
  // founderId / investorId — no longer required (any pair can chat now)
  isLegacy: { type: Boolean, default: false },   // chats from before subscription launch
  startedBy: ObjectId,                          // who initiated
  startedWasFreeChat: Boolean,                   // did the starter use their monthly free chat?
  ...rest unchanged
}
```

#### Removed business rule

```diff
- Investor likes pitch → founder approves → chat unlocks
+ Anyone follows anyone (one click) → can start a chat
+ Free user: 1 new chat per month, then paywall
+ Pro user: unlimited new chats
```

---

### 25.9 Frontend — what changes

| Page / Component                | Change                                                                         |
| ------------------------------- | ------------------------------------------------------------------------------ |
| Sidebar (founder)               | "My Pitches" replaced by **"My Studio"** (sub-tabs: Pitches \| Posts)          |
| Sidebar (investor)              | "Saved" renamed to **"Saved Studio"** (sub-tabs: Saved Pitches \| Saved Posts) |
| New page: UploadPostPage        | Drag-drop carousel + caption + link + hashtags + 10/day counter                |
| New component: PostDetailModal  | Instagram-style modal with arrow-key/swipe between user's posts                |
| New component: FollowButton     | One-click follow/unfollow with optimistic UI                                   |
| InvestorFeed (now used by both) | Founder mode: hide Invest, show Follow + DM. Skip viewer's own content         |
| PitchCard                       | Add "Boosted" gold ribbon when pitch.boost.status === 'active'                 |
| New page: SubscriptionPage      | 3 cards (Free, Pro, course-bundle), mock-pay flow, comparison table            |
| New component: ChatStartPaywall | Modal that appears when free user hits limit — "Subscribe for unlimited"       |
| New component: CallPaywall      | Same as above, blocks call initiation if free                                  |
| New component: BoostModal       | Modal with 3 tier cards, mock-pay flow, applied to a specific pitch            |
| MyStudioPage                    | Founder profile page replacement — bio + tabs + boost CTAs on each pitch       |
| FounderProfileModal             | Add Follow + DM + (investor only) Invest. Drop "approve mutual" UI             |

---

### 25.10 Mock vs real backend

```
v1 (now) — backend already built without these features:
  → Mock the new pieces in localStorage on the frontend
  → src/lib/auth.js gains: getSubscription(), setSubscription(),
    getFollowing(), follow(), unfollow(), incrementFreeChat()
  → mockData.js gains: MOCK_POSTS, MOCK_FOLLOWS, MOCK_BOOSTS

v2 (later) — wire to real backend:
  → Backend gets: post module, follow module, subscription module, boost module
  → Frontend swaps localStorage helpers for axios calls
```

---

_Last updated: June 2026_
_v2 features locked in: Posts, Follow, Subscription paywall, Boost-a-pitch_
