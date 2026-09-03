                                                                       
                                                                            

import { userService } from "../services/userService";

const KEY = "expglo:auth";
const SUB_KEY = "expglo:sub";
const FOLLOW_KEY = "expglo:follows";

const VALID_ROLES = ["founder", "investor", "admin"];

                                                     

export function getAuth() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !VALID_ROLES.includes(parsed.role)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setAuth({ role, identifier }) {
  if (!VALID_ROLES.includes(role)) return;
  localStorage.setItem(
    KEY,
    JSON.stringify({
      role,
      identifier: identifier || "",
      loggedInAt: Date.now(),
    }),
  );
}

export function clearAuth() {
  localStorage.removeItem(KEY);
  localStorage.removeItem(SUB_KEY);
  localStorage.removeItem(FOLLOW_KEY);
}

export function getRole() {
  return getAuth()?.role || null;
}

export function isLoggedIn() {
  return !!getAuth();
}

                                                      

const FREE_CHATS_PER_MONTH = 1;
const FREE_BOOSTS_PER_MONTH = 0;

const defaultSub = () => ({
  plan: "free",                  
  status: "inactive",                                     
  startedAt: null,
  expiresAt: null,
  freeChatsUsedThisMonth: 0,
  freeBoostsUsedThisMonth: 0,
  countersResetAt: nextMonthIso(),
});

function nextMonthIso() {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export function getSubscription() {
  try {
    const raw = localStorage.getItem(SUB_KEY);
    if (!raw) return defaultSub();
    const parsed = JSON.parse(raw);

                                  
    if (
      !parsed.countersResetAt ||
      new Date(parsed.countersResetAt) <= new Date()
    ) {
      parsed.freeChatsUsedThisMonth = 0;
      parsed.freeBoostsUsedThisMonth = 0;
      parsed.countersResetAt = nextMonthIso();
      localStorage.setItem(SUB_KEY, JSON.stringify(parsed));
    }

                                    
    if (
      parsed.status === "active" &&
      parsed.expiresAt &&
      new Date(parsed.expiresAt) <= new Date()
    ) {
      parsed.status = "expired";
      parsed.plan = "free";
      localStorage.setItem(SUB_KEY, JSON.stringify(parsed));
    }

    return parsed;
  } catch {
    return defaultSub();
  }
}

export function isPro() {
  const sub = getSubscription();
  return sub.plan === "pro" && sub.status === "active";
}

export function activatePro() {
  const now = new Date();
  const expires = new Date(now);
  expires.setMonth(expires.getMonth() + 1);

  const sub = getSubscription();
  localStorage.setItem(
    SUB_KEY,
    JSON.stringify({
      ...sub,
      plan: "pro",
      status: "active",
      startedAt: now.toISOString(),
      expiresAt: expires.toISOString(),
    }),
  );
}

export function cancelPro() {
  const sub = getSubscription();
  localStorage.setItem(
    SUB_KEY,
    JSON.stringify({
      ...sub,
      plan: "free",
      status: "expired",
    }),
  );
}

                                                                         
                                                                     
                                                        
export function syncSubscriptionFromUser(user) {
  if (!user) return;
  const serverSub = user.subscription || {};
  const isProNow =
    serverSub.plan === "pro" &&
    serverSub.status === "active" &&
    serverSub.expiresAt &&
    new Date(serverSub.expiresAt) > new Date();

  const current = getSubscription();
  localStorage.setItem(
    SUB_KEY,
    JSON.stringify({
      ...current,
      plan: isProNow ? "pro" : "free",
      status: isProNow
        ? "active"
        : current.status === "active"
          ? "expired"
          : current.status,
      startedAt: serverSub.startedAt || current.startedAt,
      expiresAt: serverSub.expiresAt || current.expiresAt,
                                                           
      freeChatsUsedThisMonth:
        user.freeChatsUsedThisMonth ?? current.freeChatsUsedThisMonth ?? 0,
    }),
  );
}

                                             
                                                        
                                                         
export function canStartChat({
  withUserId,
  isLegacy = false,
  role = null,
} = {}) {
  if (isLegacy) return { allowed: true, freeRemaining: 0 };
                               
  const effectiveRole = role || getRole();
  if (effectiveRole === "founder") {
    return { allowed: true, freeRemaining: Infinity, isFreeChat: false };
  }
  if (isPro()) return { allowed: true, freeRemaining: Infinity };
  const sub = getSubscription();
  const used = sub.freeChatsUsedThisMonth || 0;
  if (used < FREE_CHATS_PER_MONTH) {
    return {
      allowed: true,
      freeRemaining: FREE_CHATS_PER_MONTH - used,
      isFreeChat: true,
    };
  }
  return {
    allowed: false,
    reason: "free-quota-reached",
    freeRemaining: 0,
    upgradeNeeded: true,
  };
}

export function consumeFreeChat() {
  const role = getRole();
  if (role === "founder") return;                         
  if (isPro()) return;                           
  const sub = getSubscription();
  localStorage.setItem(
    SUB_KEY,
    JSON.stringify({
      ...sub,
      freeChatsUsedThisMonth: (sub.freeChatsUsedThisMonth || 0) + 1,
    }),
  );
}

                              
                                                   
export function canStartCall(role = null) {
  const effectiveRole = role || getRole();
  if (effectiveRole === "founder") return { allowed: true };
  if (isPro()) return { allowed: true };
  return {
    allowed: false,
    reason: "pro-required",
    upgradeNeeded: true,
  };
}

                                                    
                                                                     
                                                           

function readFollowSet() {
  try {
    const raw = localStorage.getItem(FOLLOW_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

function writeFollowSet(set) {
  localStorage.setItem(FOLLOW_KEY, JSON.stringify([...set]));
}

export function getFollowing() {
  return [...readFollowSet()];
}

export function isFollowing(userId) {
  return readFollowSet().has(userId);
}

export function follow(userId) {
  const set = readFollowSet();
  set.add(userId);
  writeFollowSet(set);
                                     
  userService.follow(userId).catch(() => {});
}

export function unfollow(userId) {
  const set = readFollowSet();
  set.delete(userId);
  writeFollowSet(set);
                                                  
  userService.follow(userId).catch(() => {});
}

export function toggleFollow(userId) {
  if (isFollowing(userId)) {
    unfollow(userId);
    return false;
  }
  follow(userId);
  return true;
}
