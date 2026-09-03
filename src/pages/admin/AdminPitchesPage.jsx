import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  HiCheck,
  HiX,
  HiTrash,
  HiLightningBolt,
  HiEye,
  HiPlay,
} from "react-icons/hi";

import DashboardShell from "../../components/dashboard/DashboardShell";
import DropdownMenu from "../../components/ui/DropdownMenu";
import Modal from "../../components/ui/Modal";
import Confirm from "../../components/ui/Confirm";
import { useToast } from "../../components/ui/Toast";
import { adminService } from "../../services/adminService";
import { formatINR } from "../../constants/mockData";

export default function AdminPitchesPage() {
  const toast = useToast();
  const [pitches, setPitches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewing, setPreviewing] = useState(null);
  const [rejecting, setRejecting] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [boosting, setBoosting] = useState(null);

  useEffect(() => {
    adminService
      .listVideos({ limit: 50 })
      .then((res) => {
        const data = res?.data?.data || res?.data;
        const list = data?.videos || data || [];
        setPitches(list);
      })
      .catch(() => setPitches([]))
      .finally(() => setLoading(false));
  }, []);

  const approve = (id) => {
    setPitches((p) =>
      p.map((x) => (x._id === id ? { ...x, status: "active" } : x)),
    );
    adminService.approveVideo(id).catch(() => {});
    toast.success("Pitch approved");
  };
  const reject = (id, reason) => {
    setPitches((p) =>
      p.map((x) =>
        x._id === id
          ? { ...x, status: "rejected", rejectionReason: reason }
          : x,
      ),
    );
    adminService.rejectVideo(id, reason).catch(() => {});
    toast.warn("Pitch rejected");
  };
  const remove = (id) => {
    setPitches((p) => p.filter((x) => x._id !== id));
    adminService.deleteVideo(id).catch(() => {});
    toast.success("Pitch removed");
  };
  const boost = (id, days) => {
    setPitches((p) =>
      p.map((x) =>
        x._id === id ? { ...x, isBoosted: true, boostedDays: days } : x,
      ),
    );
    adminService.boostVideo(id, days).catch(() => {});
    toast.success(`Boosted for ${days} days`);
  };

  return (
    <DashboardShell
      mode="admin"
      title="Pitch moderation"
      subtitle="Approve, reject, boost or remove pitches."
    >
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-[3px] border-gold/20 border-t-gold animate-spin" />
          </div>
        ) : pitches.length === 0 ? (
          <div className="col-span-full text-center py-20 text-gray-400">
            No pitches found.
          </div>
        ) : (
          pitches.map((p) => (
            <motion.div
              key={p._id}
              className="bg-card-bg/60 border-2 border-gold/15 rounded-2xl overflow-hidden"
              whileHover={{ y: -3 }}
            >
              <div className="relative">
                <img
                  src={p.thumbnailUrl}
                  alt={p.title}
                  className="w-full h-44 object-cover"
                />
                <button
                  onClick={() => setPreviewing(p)}
                  className="absolute inset-0 flex items-center justify-center bg-dark-navy/40 hover:bg-dark-navy/60 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-full bg-gold flex items-center justify-center group-hover:scale-110 transition-transform">
                    <HiPlay className="w-6 h-6 text-dark-navy ml-0.5" />
                  </div>
                </button>
                {p.isBoosted && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-gold text-dark-navy text-[10px] font-black rounded-full uppercase">
                    Boosted
                  </span>
                )}
                <div className="absolute top-2 right-2">
                  <DropdownMenu
                    triggerClass="p-1.5 rounded-full bg-dark-navy/80 backdrop-blur text-white hover:bg-dark-navy"
                    items={[
                      {
                        label: "Preview",
                        icon: HiEye,
                        onClick: () => setPreviewing(p),
                      },
                      {
                        label: "Approve",
                        icon: HiCheck,
                        onClick: () => approve(p._id),
                      },
                      {
                        label: "Boost",
                        icon: HiLightningBolt,
                        onClick: () => setBoosting(p),
                      },
                      { divider: true },
                      {
                        label: "Reject",
                        icon: HiX,
                        onClick: () => setRejecting(p),
                        danger: true,
                      },
                      {
                        label: "Delete pitch",
                        icon: HiTrash,
                        onClick: () => setDeleting(p),
                        danger: true,
                      },
                    ]}
                  />
                </div>
              </div>
              <div className="p-4">
                <p className="font-bold mb-1 line-clamp-1">{p.title}</p>
                <p className="text-xs text-gray-400 mb-2 line-clamp-2">
                  {p.description}
                </p>
                <p className="text-xs text-gold font-bold mb-3">
                  {p.founderId?.companyName || p.founderId?.name || "Unknown"} ·{" "}
                  {p.industry}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Btn
                    icon={HiEye}
                    label="View"
                    onClick={() => setPreviewing(p)}
                  />
                  <Btn
                    icon={HiCheck}
                    label="Approve"
                    accent="green"
                    onClick={() => approve(p._id)}
                  />
                  <Btn
                    icon={HiX}
                    label="Reject"
                    accent="red"
                    onClick={() => setRejecting(p)}
                  />
                  <Btn
                    icon={HiLightningBolt}
                    label="Boost"
                    accent="gold"
                    onClick={() => setBoosting(p)}
                  />
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {             }
      <Modal
        open={!!previewing}
        onClose={() => setPreviewing(null)}
        title={previewing?.title}
        maxWidth="max-w-2xl"
      >
        {previewing && (
          <>
            <div className="aspect-[9/16] max-h-[60vh] mx-auto rounded-2xl overflow-hidden bg-black mb-3">
              <video
                src={previewing.videoUrl || "/pitchvideo.mp4"}
                controls
                autoPlay
                className="w-full h-full object-cover"
                poster={previewing.thumbnailUrl}
              />
            </div>
            <p className="text-sm text-gray-300 mb-4">
              {previewing.description}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Detail
                label="Founder"
                value={previewing.founderId?.name || "Unknown"}
              />
              <Detail label="Asking" value={formatINR(previewing.askAmount)} />
              <Detail label="Equity" value={`${previewing.equityOffered}%`} />
              <Detail label="Industry" value={previewing.industry} />
            </div>
          </>
        )}
      </Modal>

      {                   }
      <RejectModal
        pitch={rejecting}
        onClose={() => setRejecting(null)}
        onConfirm={(reason) => reject(rejecting._id, reason)}
      />

      {                }
      <BoostModal
        pitch={boosting}
        onClose={() => setBoosting(null)}
        onConfirm={(days) => boost(boosting._id, days)}
      />

      {                    }
      <Confirm
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => remove(deleting._id)}
        title="Delete this pitch?"
        message={`"${deleting?.title}" will be removed from the feed and Cloudinary.`}
        confirmLabel="Delete"
        destructive
      />
    </DashboardShell>
  );
}

function RejectModal({ pitch, onClose, onConfirm }) {
  const [reason, setReason] = useState("");
  if (!pitch) return null;
  return (
    <Modal open={!!pitch} onClose={onClose} title="Reject pitch">
      <p className="text-sm text-gray-300 mb-3">"{pitch.title}"</p>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={3}
        placeholder="Reason for rejection (sent to founder)…"
        className="w-full px-4 py-3 bg-dark-bg/60 border-2 border-gold/20 rounded-xl text-white placeholder-gray-500 focus:border-gold focus:outline-none resize-none mb-3"
      />
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2.5 border-2 border-gold/20 hover:border-gold/50 rounded-xl font-bold text-sm"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            onConfirm(reason);
            onClose();
          }}
          className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm"
        >
          Reject
        </button>
      </div>
    </Modal>
  );
}

function BoostModal({ pitch, onClose, onConfirm }) {
  const [days, setDays] = useState(7);
  if (!pitch) return null;
  return (
    <Modal open={!!pitch} onClose={onClose} title="Boost pitch">
      <p className="text-sm text-gray-300 mb-3">
        Boosted pitches show first in the investor feed.
      </p>
      <div className="flex gap-2 mb-4">
        {[3, 7, 14, 30].map((d) => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`flex-1 py-3 rounded-xl font-bold text-sm border-2 transition-all ${
              days === d
                ? "border-gold bg-gold/10 text-gold"
                : "border-gold/15 hover:border-gold/40"
            }`}
          >
            {d} days
          </button>
        ))}
      </div>
      <button
        onClick={() => {
          onConfirm(days);
          onClose();
        }}
        className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-gold to-bright-gold text-dark-navy shadow-lg shadow-gold/30"
      >
        Boost for {days} days
      </button>
    </Modal>
  );
}

function Btn({ icon: Icon, label, accent = "default", onClick }) {
  const cls =
    accent === "green"
      ? "border-emerald-500/30 hover:border-emerald-500 text-emerald-400"
      : accent === "red"
        ? "border-red-500/30 hover:border-red-500 text-red-400"
        : accent === "gold"
          ? "border-gold/40 hover:border-gold text-gold"
          : "border-gold/15 hover:border-gold/40 text-gray-300";
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1.5 border-2 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${cls}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}

function Detail({ label, value }) {
  return (
    <div className="bg-dark-bg/40 rounded-lg p-2.5">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="font-bold text-sm capitalize">{value}</p>
    </div>
  );
}
