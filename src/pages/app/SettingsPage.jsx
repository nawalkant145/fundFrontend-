import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiUser,
  HiLockClosed,
  HiBell,
  HiShieldCheck,
  HiTrash,
} from "react-icons/hi";

import DashboardShell from "../../components/dashboard/DashboardShell";
import { FormField, Checkbox } from "../../components/auth/FormField";
import Confirm from "../../components/ui/Confirm";
import { useToast } from "../../components/ui/Toast";
import { useAuth } from "../../context/AuthContext";
import { userService } from "../../services/userService";
import { authService } from "../../services/authService";

const TABS = [
  { value: "account", label: "Account", icon: HiUser },
  { value: "security", label: "Security", icon: HiLockClosed },
  { value: "notifications", label: "Notifications", icon: HiBell },
  { value: "privacy", label: "Privacy", icon: HiShieldCheck },
];

export default function SettingsPage() {
  const [tab, setTab] = useState("account");

  return (
    <DashboardShell title="Settings" subtitle="Manage your account.">
      <div className="grid lg:grid-cols-[200px_1fr] gap-6">
        {/* Sidebar tabs */}
        <div className="bg-card-bg/60 border-2 border-gold/15 rounded-2xl p-2 h-fit overflow-x-auto">
          <div className="flex lg:flex-col gap-1">
            {TABS.map((t) => (
              <button
                key={t.value}
                onClick={() => setTab(t.value)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                  tab === t.value
                    ? "bg-gold/10 text-gold"
                    : "text-gray-400 hover:bg-dark-bg/40 hover:text-white"
                }`}
              >
                <t.icon className="w-4 h-4" />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Panel */}
        <div className="bg-card-bg/60 border-2 border-gold/15 rounded-2xl p-6">
          {tab === "account" && <AccountTab />}
          {tab === "security" && <SecurityTab />}
          {tab === "notifications" && <NotificationsTab />}
          {tab === "privacy" && <PrivacyTab />}
        </div>
      </div>
    </DashboardShell>
  );
}

function AccountTab() {
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const avatarRef = useRef(null);
  const isFounder = user?.role === "founder";
  const [data, setData] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    companyName: user?.companyName || "",
    industry: user?.industry || "",
    website: user?.website || "",
    linkedIn: user?.linkedIn || "",
  });
  const [saving, setSaving] = useState(false);
  const handle = (e) =>
    setData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await userService.uploadAvatar(file);
      await refreshUser();
      toast.success("Profile photo updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    }
  };

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-bold text-[#0A1F14]">Account information</h3>

      {/* Avatar upload */}
      <div className="flex items-center gap-4">
        <img
          src={
            user?.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "U")}&background=1B5E3F&color=fff&size=160`
          }
          alt={user?.name}
          className="w-16 h-16 rounded-full object-cover ring-2 ring-[#1B5E3F]/20"
        />
        <div>
          <button
            onClick={() => avatarRef.current?.click()}
            className="px-4 py-2 bg-gradient-to-br from-[#1B5E3F] to-[#0F4A2E] text-white text-xs font-bold rounded-full shadow-md"
          >
            Change photo
          </button>
          <input
            ref={avatarRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
          <p className="text-xs text-[#0A1F14]/55 mt-1">JPG, PNG · Max 5MB</p>
        </div>
      </div>

      <FormField
        label="Full name"
        name="name"
        icon={HiUser}
        value={data.name}
        onChange={handle}
      />
      {/* Username & email are read-only (unique, verified) */}
      <div>
        <label className="block text-sm font-semibold mb-1.5 text-gray-300">
          Username
        </label>
        <div className="px-4 py-3 bg-[#FAFAF7] border border-[#1B5E3F]/10 rounded-xl text-[#0A1F14]/60 text-sm">
          @{user?.username || "user"}{" "}
          <span className="text-xs text-[#0A1F14]/40">· cannot be changed</span>
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1.5 text-gray-300">
          Email
        </label>
        <div className="px-4 py-3 bg-[#FAFAF7] border border-[#1B5E3F]/10 rounded-xl text-[#0A1F14]/60 text-sm">
          {user?.email}{" "}
          {user?.isEmailVerified && (
            <span className="text-xs text-emerald-600">· verified</span>
          )}
        </div>
      </div>

      {isFounder && (
        <>
          <FormField
            label="Company name"
            name="companyName"
            value={data.companyName}
            onChange={handle}
          />
          <FormField
            label="Industry"
            name="industry"
            value={data.industry}
            onChange={handle}
          />
          <FormField
            label="Website"
            name="website"
            value={data.website}
            onChange={handle}
            placeholder="https://yourcompany.com"
          />
          <FormField
            label="LinkedIn"
            name="linkedIn"
            value={data.linkedIn}
            onChange={handle}
            placeholder="linkedin.com/in/you"
          />
        </>
      )}

      <div>
        <label className="block text-sm font-semibold mb-2 text-gray-300">
          Bio
        </label>
        <textarea
          name="bio"
          value={data.bio}
          onChange={handle}
          rows={3}
          className="w-full px-4 py-3 bg-white border border-[#1B5E3F]/15 rounded-xl text-[#0A1F14] focus:border-[#1B5E3F]/60 focus:outline-none resize-none"
        />
      </div>
      <motion.button
        whileHover={{ scale: 1.01, y: -2 }}
        whileTap={{ scale: 0.99 }}
        disabled={saving}
        onClick={async () => {
          setSaving(true);
          try {
            const payload = { name: data.name, bio: data.bio };
            if (isFounder) {
              payload.companyName = data.companyName;
              payload.industry = data.industry;
              payload.website = data.website;
              payload.linkedIn = data.linkedIn;
            }
            await userService.updateProfile(payload);
            await refreshUser();
            toast.success("Profile saved ✓");
          } catch (err) {
            toast.error(err.response?.data?.message || "Save failed");
          } finally {
            setSaving(false);
          }
        }}
        className={`px-6 py-3 rounded-full font-bold bg-gradient-to-br from-[#1B5E3F] to-[#0F4A2E] text-white shadow-md shadow-[#1B5E3F]/25 ${saving ? "opacity-60" : ""}`}
      >
        {saving ? "Saving…" : "Save changes"}
      </motion.button>
    </div>
  );
}

function SecurityTab() {
  const toast = useToast();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [pw, setPw] = useState({ current: "", new: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const handle = (e) =>
    setPw((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async () => {
    if (!pw.current || !pw.new || !pw.confirm) {
      toast.error("Please fill in all password fields");
      return;
    }
    if (pw.new.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (pw.new !== pw.confirm) {
      toast.error("New passwords do not match");
      return;
    }
    if (pw.new === pw.current) {
      toast.error("New password must be different from current password");
      return;
    }
    setSaving(true);
    try {
      await authService.changePassword({
        oldPassword: pw.current,
        newPassword: pw.new,
      });
      toast.success("Password changed. Please log in again.");
      // Server clears the session cookies → force re-login
      setTimeout(async () => {
        await logout();
        navigate("/login", { replace: true });
      }, 1200);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-bold">Security</h3>
      <FormField
        label="Current password"
        name="current"
        icon={HiLockClosed}
        type="password"
        placeholder="••••••••"
        value={pw.current}
        onChange={handle}
      />
      <FormField
        label="New password"
        name="new"
        icon={HiLockClosed}
        type="password"
        placeholder="At least 8 characters"
        value={pw.new}
        onChange={handle}
      />
      <FormField
        label="Confirm new password"
        name="confirm"
        icon={HiLockClosed}
        type="password"
        placeholder="Repeat new password"
        value={pw.confirm}
        onChange={handle}
      />
      <motion.button
        whileHover={{ scale: 1.01, y: -2 }}
        whileTap={{ scale: 0.99 }}
        disabled={saving}
        onClick={submit}
        className={`px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-gold to-bright-gold text-dark-navy shadow-lg shadow-gold/30 ${saving ? "opacity-60" : ""}`}
      >
        {saving ? "Changing…" : "Change password"}
      </motion.button>

      <div className="pt-6 border-t border-gold/10 space-y-3">
        <h4 className="font-bold">This device</h4>
        <SessionRow device={getCurrentDevice()} current />
        <p className="text-xs text-gray-400">
          Changing your password signs out all other devices.
        </p>
      </div>
    </div>
  );
}

// Parse a friendly "Browser on OS" label from the user agent.
function getCurrentDevice() {
  if (typeof navigator === "undefined") return "This device";
  const ua = navigator.userAgent;
  let browser = "Browser";
  if (/edg/i.test(ua)) browser = "Edge";
  else if (/chrome|crios/i.test(ua)) browser = "Chrome";
  else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
  else if (/safari/i.test(ua)) browser = "Safari";

  let os = "";
  if (/windows/i.test(ua)) os = "Windows";
  else if (/android/i.test(ua)) os = "Android";
  else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";
  else if (/mac os/i.test(ua)) os = "macOS";
  else if (/linux/i.test(ua)) os = "Linux";

  return os ? `${browser} on ${os}` : browser;
}

const NOTIF_PREFS = [
  { key: "likes", label: "When an investor likes my pitch" },
  { key: "saves", label: "When an investor saves my pitch" },
  { key: "messages", label: "New messages" },
  { key: "investmentInterest", label: "Investment interest received" },
  { key: "weeklyDigest", label: "Weekly digest email" },
  { key: "pitchExpiry", label: "Pitch expiry reminders" },
];

function NotificationsTab() {
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const [prefs, setPrefs] = useState(() => {
    const stored = user?.notificationPrefs || {};
    const init = {};
    NOTIF_PREFS.forEach((p) => {
      init[p.key] = stored[p.key] !== undefined ? stored[p.key] : true;
    });
    return init;
  });
  const [saving, setSaving] = useState(false);

  const toggle = (key) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  const save = async () => {
    setSaving(true);
    try {
      await userService.updateProfile({ notificationPrefs: prefs });
      await refreshUser();
      toast.success("Notification preferences saved ✓");
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold mb-2">Notification preferences</h3>
      {NOTIF_PREFS.map(({ key, label }) => (
        <label
          key={key}
          className="flex items-center justify-between gap-2 p-3 hover:bg-dark-bg/40 rounded-xl cursor-pointer"
        >
          <span className="text-sm text-gray-300">{label}</span>
          <ToggleSwitch on={prefs[key]} onToggle={() => toggle(key)} />
        </label>
      ))}
      <div className="pt-4">
        <motion.button
          whileHover={{ scale: 1.01, y: -2 }}
          whileTap={{ scale: 0.99 }}
          disabled={saving}
          onClick={save}
          className={`px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-gold to-bright-gold text-dark-navy shadow-lg shadow-gold/30 ${saving ? "opacity-60" : ""}`}
        >
          {saving ? "Saving…" : "Save changes"}
        </motion.button>
      </div>
    </div>
  );
}

function PrivacyTab() {
  const toast = useToast();
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [confirmDel, setConfirmDel] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const prefs = user?.privacyPrefs || {};
  const [investorsOnly, setInvestorsOnly] = useState(
    prefs.investorsOnly ?? false,
  );
  const [openToConnect, setOpenToConnect] = useState(
    user?.openToConnect ?? true,
  );
  const [dataMatching, setDataMatching] = useState(prefs.dataMatching ?? false);

  const persist = async (payload, label) => {
    try {
      await userService.updateProfile(payload);
      await refreshUser();
      toast.success(label || "Setting saved");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not save setting");
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await userService.deleteAccount();
      toast.success("Your account has been deleted");
      await logout();
      navigate("/", { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete account");
      setDeleting(false);
      setConfirmDel(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold">Privacy</h3>
      <Checkbox
        checked={investorsOnly}
        onChange={() => {
          const next = !investorsOnly;
          setInvestorsOnly(next);
          persist({ privacyPrefs: { ...prefs, investorsOnly: next } });
        }}
      >
        Show my profile to verified investors only
      </Checkbox>
      <Checkbox
        checked={openToConnect}
        onChange={() => {
          const next = !openToConnect;
          setOpenToConnect(next);
          persist(
            { openToConnect: next },
            next ? "You're open to new connections" : "New connections paused",
          );
        }}
      >
        Open to new connections
      </Checkbox>
      <Checkbox
        checked={dataMatching}
        onChange={() => {
          const next = !dataMatching;
          setDataMatching(next);
          persist({ privacyPrefs: { ...prefs, dataMatching: next } });
        }}
      >
        Allow my data to be used for matching algorithms
      </Checkbox>

      <div className="pt-6 border-t border-red-500/20 mt-6">
        <h4 className="font-bold text-red-400 mb-2">Danger zone</h4>
        <p className="text-sm text-gray-400 mb-3">
          Permanently delete your account and all your data.
        </p>
        <button
          onClick={() => setConfirmDel(true)}
          className="px-4 py-2.5 bg-red-500/15 hover:bg-red-500/25 text-red-400 rounded-xl text-sm font-bold flex items-center gap-2 border border-red-500/30"
        >
          <HiTrash className="w-4 h-4" />
          Delete my account
        </button>
      </div>

      <Confirm
        open={confirmDel}
        onClose={() => !deleting && setConfirmDel(false)}
        onConfirm={handleDelete}
        title="Delete your account?"
        message="This action is permanent. All your data, pitches, chats, and investments will be removed."
        confirmLabel={deleting ? "Deleting…" : "Delete account"}
        destructive
      />
    </div>
  );
}

function ToggleSwitch({ on: controlledOn, onToggle, defaultOn }) {
  const [internalOn, setInternalOn] = useState(defaultOn);
  const isControlled = controlledOn !== undefined;
  const on = isControlled ? controlledOn : internalOn;
  const handle = () => {
    if (isControlled) onToggle?.();
    else setInternalOn((v) => !v);
  };
  return (
    <button
      type="button"
      onClick={handle}
      className={`w-11 h-6 rounded-full transition-colors relative ${
        on ? "bg-gold" : "bg-gray-700"
      }`}
    >
      <motion.span
        animate={{ x: on ? 22 : 2 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="absolute top-1 w-4 h-4 bg-white rounded-full"
      />
    </button>
  );
}

function SessionRow({ device, location, current }) {
  return (
    <div className="flex items-center justify-between p-3 bg-dark-bg/40 rounded-xl">
      <div>
        <p className="font-semibold text-sm">{device}</p>
        {location && <p className="text-xs text-gray-400">{location}</p>}
      </div>
      {current ? (
        <span className="text-xs text-emerald-400 font-bold">
          ● This device
        </span>
      ) : (
        <button className="text-xs text-red-400 hover:text-red-300 font-semibold">
          Sign out
        </button>
      )}
    </div>
  );
}
