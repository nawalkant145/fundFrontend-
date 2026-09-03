import { useState } from "react";
import { motion } from "framer-motion";
import { HiSpeakerphone, HiMail, HiUsers } from "react-icons/hi";

import DashboardShell from "../../components/dashboard/DashboardShell";
import { useToast } from "../../components/ui/Toast";
import { adminService } from "../../services/adminService";

                                                                                                                                               
export default function AdminBroadcastPage() {
  const toast = useToast();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [role, setRole] = useState("");            
  const [sendEmail, setSendEmail] = useState(false);
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState([]);

  const send = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      toast.error("Title and body are required");
      return;
    }
    setSending(true);
    try {
      const res = await adminService.broadcast({
        title: title.trim(),
        body: body.trim(),
        role: role || undefined,
        sendEmail,
      });
      const data = res?.data?.data || res?.data;
      const count = data?.sent || 0;
      toast.success(`Broadcast sent to ${count} users`);
      setHistory((prev) => [
        {
          id: Date.now(),
          title: title.trim(),
          role: role || "all",
          count,
          sentAt: new Date().toLocaleString(),
          email: sendEmail,
        },
        ...prev,
      ]);
      setTitle("");
      setBody("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Broadcast failed");
    } finally {
      setSending(false);
    }
  };

  return (
    <DashboardShell
      mode="admin"
      title="Broadcast"
      subtitle="Send notifications to all users or specific segments."
    >
      <div className="max-w-2xl">
        <form
          onSubmit={send}
          className="bg-card-bg/60 border-2 border-gold/15 rounded-2xl p-6 space-y-4 mb-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gold/15 flex items-center justify-center">
              <HiSpeakerphone className="w-5 h-5 text-gold" />
            </div>
            <div>
              <h3 className="font-bold">New broadcast</h3>
              <p className="text-xs text-gray-400">
                Delivered instantly as in-app notifications
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1">
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Platform maintenance tonight"
              className="w-full px-4 py-3 bg-dark-bg/60 border-2 border-gold/20 rounded-xl text-white placeholder-gray-500 focus:border-gold focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1">
              Body
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              placeholder="We'll be doing a scheduled maintenance from 2–4 AM IST…"
              className="w-full px-4 py-3 bg-dark-bg/60 border-2 border-gold/20 rounded-xl text-white placeholder-gray-500 focus:border-gold focus:outline-none resize-none"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">
                Target audience
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-3 bg-dark-bg/60 border-2 border-gold/20 rounded-xl text-white focus:border-gold focus:outline-none"
              >
                <option value="">Everyone</option>
                <option value="founder">Founders only</option>
                <option value="investor">Investors only</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm cursor-pointer py-3">
                <input
                  type="checkbox"
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                  className="accent-gold"
                />
                <HiMail className="w-4 h-4 text-gold" />
                Also send via email
              </label>
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={sending || !title.trim() || !body.trim()}
            whileHover={!sending ? { scale: 1.01 } : {}}
            whileTap={!sending ? { scale: 0.99 } : {}}
            className={`w-full py-3.5 rounded-xl font-bold bg-gradient-to-r from-gold to-bright-gold text-dark-navy shadow-lg shadow-gold/30 flex items-center justify-center gap-2 ${
              sending ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {sending ? (
              <span className="w-5 h-5 rounded-full border-2 border-dark-navy/30 border-t-dark-navy animate-spin" />
            ) : (
              <>
                <HiSpeakerphone className="w-5 h-5" /> Send broadcast
              </>
            )}
          </motion.button>
        </form>

        {                                                      }
        {history.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-gray-300 mb-2">
              Sent this session
            </h3>
            {history.map((h) => (
              <div
                key={h.id}
                className="bg-dark-bg/40 border border-gold/10 rounded-xl p-3 flex items-center gap-3"
              >
                <HiUsers className="w-5 h-5 text-gold flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{h.title}</p>
                  <p className="text-xs text-gray-400">
                    {h.count} recipients · {h.role} · {h.sentAt}
                    {h.email && " · + email"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
