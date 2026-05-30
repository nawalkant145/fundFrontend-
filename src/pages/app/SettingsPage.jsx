import { useState } from "react";
import { motion } from "framer-motion";
import {
  HiUser,
  HiAtSymbol,
  HiMail,
  HiLockClosed,
  HiBell,
  HiShieldCheck,
  HiTrash,
} from "react-icons/hi";

import DashboardShell from "../../components/dashboard/DashboardShell";
import { FormField, Checkbox } from "../../components/auth/FormField";
import Confirm from "../../components/ui/Confirm";
import { useToast } from "../../components/ui/Toast";
import { CURRENT_USER } from "../../constants/mockData";

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
  const [data, setData] = useState({
    name: CURRENT_USER.name,
    username: CURRENT_USER.username,
    email: CURRENT_USER.email,
    bio: CURRENT_USER.bio,
  });
  const handle = (e) =>
    setData((p) => ({ ...p, [e.target.name]: e.target.value }));
  return (
    <div className="space-y-5">
      <h3 className="text-lg font-bold">Account information</h3>
      <FormField
        label="Full name"
        name="name"
        icon={HiUser}
        value={data.name}
        onChange={handle}
      />
      <FormField
        label="Username"
        name="username"
        icon={HiAtSymbol}
        value={data.username}
        onChange={handle}
      />
      <FormField
        label="Email"
        name="email"
        icon={HiMail}
        type="email"
        value={data.email}
        onChange={handle}
      />
      <div>
        <label className="block text-sm font-semibold mb-2 text-gray-300">
          Bio
        </label>
        <textarea
          name="bio"
          value={data.bio}
          onChange={handle}
          rows={3}
          className="w-full px-4 py-3 bg-dark-bg/60 border-2 border-gold/20 rounded-xl text-white focus:border-gold focus:outline-none resize-none"
        />
      </div>
      <SaveButton />
    </div>
  );
}

function SecurityTab() {
  return (
    <div className="space-y-5">
      <h3 className="text-lg font-bold">Security</h3>
      <FormField
        label="Current password"
        name="current"
        icon={HiLockClosed}
        type="password"
        placeholder="••••••••"
      />
      <FormField
        label="New password"
        name="new"
        icon={HiLockClosed}
        type="password"
        placeholder="At least 8 characters"
      />
      <FormField
        label="Confirm new password"
        name="confirm"
        icon={HiLockClosed}
        type="password"
        placeholder="Repeat new password"
      />
      <SaveButton label="Change password" />

      <div className="pt-6 border-t border-gold/10 space-y-3">
        <h4 className="font-bold">Active sessions</h4>
        <SessionRow device="Chrome on Windows" location="Mumbai" current />
        <SessionRow device="iOS App" location="Bangalore" />
      </div>
    </div>
  );
}

function NotificationsTab() {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold mb-2">Notification preferences</h3>
      {[
        "When an investor likes my pitch",
        "When an investor saves my pitch",
        "New messages",
        "Investment interest received",
        "Weekly digest email",
        "Pitch expiry reminders",
      ].map((label) => (
        <label
          key={label}
          className="flex items-center justify-between gap-2 p-3 hover:bg-dark-bg/40 rounded-xl cursor-pointer"
        >
          <span className="text-sm text-gray-300">{label}</span>
          <ToggleSwitch defaultOn />
        </label>
      ))}
      <div className="pt-4">
        <SaveButton />
      </div>
    </div>
  );
}

function PrivacyTab() {
  const toast = useToast();
  const [confirmDel, setConfirmDel] = useState(false);
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold">Privacy</h3>
      <Checkbox checked onChange={() => toast.info("Setting saved")}>
        Show my profile to verified investors only
      </Checkbox>
      <Checkbox checked onChange={() => toast.info("Setting saved")}>
        Open to new connections
      </Checkbox>
      <Checkbox checked={false} onChange={() => toast.info("Setting saved")}>
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
        onClose={() => setConfirmDel(false)}
        onConfirm={() => toast.warn("Account deletion requested")}
        title="Delete your account?"
        message="This action is permanent. All your data, pitches, chats, and investments will be removed."
        confirmLabel="Delete account"
        destructive
      />
    </div>
  );
}

function SaveButton({ label = "Save changes" }) {
  const toast = useToast();
  return (
    <motion.button
      whileHover={{ scale: 1.01, y: -2 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => toast.success(`${label} ✓`)}
      className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-gold to-bright-gold text-dark-navy shadow-lg shadow-gold/30"
    >
      {label}
    </motion.button>
  );
}

function ToggleSwitch({ defaultOn }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      type="button"
      onClick={() => setOn((v) => !v)}
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
        <p className="text-xs text-gray-400">{location}</p>
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
