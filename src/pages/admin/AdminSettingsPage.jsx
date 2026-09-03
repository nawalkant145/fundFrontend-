import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { HiSave, HiPlus, HiX } from "react-icons/hi";

import DashboardShell from "../../components/dashboard/DashboardShell";
import { useToast } from "../../components/ui/Toast";
import { adminService } from "../../services/adminService";

export default function AdminSettingsPage() {
  const toast = useToast();
  const [s, setS] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newWord, setNewWord] = useState("");

  useEffect(() => {
    adminService
      .getSettings()
      .then((res) => {
        const data = res?.data?.data || res?.data;
        setS(data?.settings || data);
      })
      .catch(() => toast.error("Failed to load settings"))
      .finally(() => setLoading(false));
                               
  }, []);

  const upd = (k, v) => setS((p) => ({ ...p, [k]: v }));

  const save = () => {
    setSaving(true);
    adminService
      .updateSettings(s)
      .then((res) => {
        const data = res?.data?.data || res?.data;
        setS(data?.settings || data);
        toast.success("Settings saved");
      })
      .catch(() => toast.error("Save failed"))
      .finally(() => setSaving(false));
  };

  const addWord = () => {
    const w = newWord.trim().toLowerCase();
    if (!w) return;
    if ((s.customBannedWords || []).includes(w)) {
      setNewWord("");
      return;
    }
    upd("customBannedWords", [...(s.customBannedWords || []), w]);
    setNewWord("");
  };
  const removeWord = (w) =>
    upd(
      "customBannedWords",
      (s.customBannedWords || []).filter((x) => x !== w),
    );

  if (loading || !s) {
    return (
      <DashboardShell mode="admin" title="Platform settings">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-[3px] border-gold/20 border-t-gold animate-spin" />
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      mode="admin"
      title="Platform settings"
      subtitle="Feature flags, limits and content moderation."
    >
      <div className="max-w-3xl space-y-6">
        {                   }
        <Section title="Feature flags">
          <Toggle
            label="Signups enabled"
            hint="Turn off to stop new account creation"
            checked={s.signupsEnabled}
            onChange={(v) => upd("signupsEnabled", v)}
          />
          <Toggle
            label="Pitch uploads enabled"
            hint="Founders can upload new pitches"
            checked={s.uploadsEnabled}
            onChange={(v) => upd("uploadsEnabled", v)}
          />
          <Toggle
            label="Posts enabled"
            hint="Founders can create posts"
            checked={s.postsEnabled}
            onChange={(v) => upd("postsEnabled", v)}
          />
          <Toggle
            label="Investments enabled"
            hint="Investors can express interest & pay"
            checked={s.investmentsEnabled}
            onChange={(v) => upd("investmentsEnabled", v)}
          />
          <Toggle
            label="Maintenance mode"
            hint="Shows a maintenance banner to all users"
            checked={s.maintenanceMode}
            onChange={(v) => upd("maintenanceMode", v)}
          />
          {s.maintenanceMode && (
            <input
              value={s.maintenanceMessage || ""}
              onChange={(e) => upd("maintenanceMessage", e.target.value)}
              placeholder="Maintenance message…"
              className="w-full px-4 py-2.5 bg-dark-bg/60 border-2 border-gold/20 rounded-xl text-white focus:border-gold focus:outline-none"
            />
          )}
        </Section>

        {            }
        <Section title="Limits">
          <NumberField
            label="Max active pitches per founder"
            value={s.maxPitchesPerFounder}
            onChange={(v) => upd("maxPitchesPerFounder", v)}
          />
          <NumberField
            label="Max posts per day"
            value={s.maxPostsPerDay}
            onChange={(v) => upd("maxPostsPerDay", v)}
          />
          <NumberField
            label="Pitch expiry (days)"
            value={s.pitchExpiryDays}
            onChange={(v) => upd("pitchExpiryDays", v)}
          />
        </Section>

        {                }
        <Section title="Content moderation">
          <Toggle
            label="Profanity filter enabled"
            hint="Auto-censor bad words in comments, posts and pitches"
            checked={s.profanityFilterEnabled}
            onChange={(v) => upd("profanityFilterEnabled", v)}
          />
          <div>
            <p className="text-sm font-bold text-gray-200 mb-1">
              Custom banned words
            </p>
            <p className="text-xs text-gray-400 mb-3">
              Added on top of the built-in list. These are censored everywhere.
            </p>
            <div className="flex gap-2 mb-3">
              <input
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addWord())
                }
                placeholder="Add a word…"
                className="flex-1 px-4 py-2.5 bg-dark-bg/60 border-2 border-gold/20 rounded-xl text-white focus:border-gold focus:outline-none"
              />
              <button
                onClick={addWord}
                className="px-4 py-2.5 bg-gold text-dark-navy rounded-xl font-bold text-sm flex items-center gap-1"
              >
                <HiPlus className="w-4 h-4" /> Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(s.customBannedWords || []).length === 0 ? (
                <p className="text-xs text-gray-500">No custom words yet.</p>
              ) : (
                s.customBannedWords.map((w) => (
                  <span
                    key={w}
                    className="px-3 py-1.5 bg-red-500/10 text-red-400 text-xs font-bold rounded-full flex items-center gap-1.5"
                  >
                    {w}
                    <button
                      onClick={() => removeWord(w)}
                      className="hover:text-red-200"
                    >
                      <HiX className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>
        </Section>

        {          }
        <motion.button
          onClick={save}
          disabled={saving}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className={`w-full py-3.5 rounded-xl font-bold bg-gradient-to-r from-gold to-bright-gold text-dark-navy shadow-lg shadow-gold/30 flex items-center justify-center gap-2 ${
            saving ? "opacity-60 cursor-not-allowed" : ""
          }`}
        >
          {saving ? (
            <span className="w-5 h-5 rounded-full border-2 border-dark-navy/30 border-t-dark-navy animate-spin" />
          ) : (
            <>
              <HiSave className="w-5 h-5" /> Save settings
            </>
          )}
        </motion.button>
      </div>
    </DashboardShell>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-card-bg/60 border-2 border-gold/15 rounded-2xl p-6 space-y-4">
      <h3 className="text-lg font-bold">{title}</h3>
      {children}
    </div>
  );
}

function Toggle({ label, hint, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-bold text-gray-200">{label}</p>
        {hint && <p className="text-xs text-gray-400">{hint}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${
          checked ? "bg-emerald-500" : "bg-gray-600"
        }`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
            checked ? "translate-x-6" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function NumberField({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm font-bold text-gray-200">{label}</p>
      <input
        type="number"
        value={value ?? 0}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-24 px-3 py-2 bg-dark-bg/60 border-2 border-gold/20 rounded-xl text-white text-center focus:border-gold focus:outline-none"
      />
    </div>
  );
}
