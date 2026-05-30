import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiPlus,
  HiPlay,
  HiPencilAlt,
  HiTrash,
  HiPause,
  HiPlay as HiResume,
  HiRefresh,
  HiEye,
  HiHeart,
  HiBookmark,
  HiShare,
  HiChartBar,
  HiDuplicate,
  HiClipboard,
} from "react-icons/hi";

import DashboardShell from "../../components/dashboard/DashboardShell";
import DropdownMenu from "../../components/ui/DropdownMenu";
import Modal from "../../components/ui/Modal";
import Confirm from "../../components/ui/Confirm";
import { useToast } from "../../components/ui/Toast";
import { FormField } from "../../components/auth/FormField";
import { MOCK_PITCHES, formatINR } from "../../constants/mockData";

export default function MyPitchesPage() {
  const toast = useToast();
  const [pitches, setPitches] = useState([
    { ...MOCK_PITCHES[0], status: "active" },
    {
      ...MOCK_PITCHES[2],
      _id: "v_old",
      status: "expired",
      title: "Old pitch — needs renewal",
    },
  ]);
  const [editing, setEditing] = useState(null);
  const [previewing, setPreviewing] = useState(null);
  const [confirming, setConfirming] = useState(null);

  const togglePause = (id) => {
    setPitches((p) =>
      p.map((x) =>
        x._id === id
          ? { ...x, status: x.status === "active" ? "paused" : "active" }
          : x,
      ),
    );
    toast.success("Pitch status updated");
  };

  const renew = (id) => {
    setPitches((p) =>
      p.map((x) => (x._id === id ? { ...x, status: "active" } : x)),
    );
    toast.success("Pitch renewed for 30 days");
  };

  const remove = (id) => {
    setPitches((p) => p.filter((x) => x._id !== id));
    toast.success("Pitch deleted");
  };

  const copyLink = (id) => {
    navigator.clipboard?.writeText(`${window.location.origin}/pitch/${id}`);
    toast.success("Link copied to clipboard");
  };

  return (
    <DashboardShell
      title="My pitches"
      subtitle="You can have one active pitch at a time."
    >
      <div className="flex justify-end mb-5">
        <Link to="/app/upload">
          <motion.button
            className="px-5 py-3 rounded-xl font-bold bg-gradient-to-r from-gold to-bright-gold text-dark-navy shadow-lg shadow-gold/30 flex items-center gap-2"
            whileHover={{ scale: 1.03, y: -2 }}
          >
            <HiPlus className="w-5 h-5" />
            New pitch
          </motion.button>
        </Link>
      </div>

      <div className="space-y-4">
        {pitches.length === 0 ? (
          <div className="bg-card-bg/60 border-2 border-gold/15 rounded-2xl p-12 text-center">
            <p className="text-gray-400 mb-4">No pitches yet.</p>
            <Link to="/app/upload">
              <button className="px-5 py-3 rounded-xl font-bold bg-gradient-to-r from-gold to-bright-gold text-dark-navy">
                Upload your first pitch
              </button>
            </Link>
          </div>
        ) : (
          pitches.map((p) => (
            <PitchRow
              key={p._id}
              pitch={p}
              onEdit={() => setEditing(p)}
              onPreview={() => setPreviewing(p)}
              onPause={() => togglePause(p._id)}
              onRenew={() => renew(p._id)}
              onCopy={() => copyLink(p._id)}
              onDelete={() => setConfirming(p)}
            />
          ))
        )}
      </div>

      {/* Edit modal */}
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Edit pitch"
      >
        {editing && (
          <EditForm
            pitch={editing}
            onSave={(updated) => {
              setPitches((p) =>
                p.map((x) =>
                  x._id === editing._id ? { ...x, ...updated } : x,
                ),
              );
              setEditing(null);
              toast.success("Pitch details updated");
            }}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>

      {/* Preview modal */}
      <Modal
        open={!!previewing}
        onClose={() => setPreviewing(null)}
        title={previewing?.title}
        maxWidth="max-w-2xl"
      >
        {previewing && (
          <div>
            <div className="aspect-[9/16] max-h-[60vh] mx-auto rounded-2xl overflow-hidden bg-black mb-4">
              <video
                src={previewing.videoUrl || "/pitchvideo.mp4"}
                controls
                autoPlay
                className="w-full h-full object-cover"
                poster={previewing.thumbnailUrl}
              />
            </div>
            <p className="text-sm text-gray-300 mb-3">
              {previewing.description}
            </p>
            <div className="flex flex-wrap gap-3 text-xs text-gray-400">
              <span>{previewing.duration}s</span>
              <span>·</span>
              <span>{previewing.industry}</span>
              <span>·</span>
              <span>
                {formatINR(previewing.askAmount)} for {previewing.equityOffered}
                %
              </span>
            </div>
          </div>
        )}
      </Modal>

      <Confirm
        open={!!confirming}
        onClose={() => setConfirming(null)}
        onConfirm={() => remove(confirming._id)}
        title="Delete this pitch?"
        message={`"${confirming?.title}" will be permanently removed. This can't be undone.`}
        confirmLabel="Delete pitch"
        destructive
      />
    </DashboardShell>
  );
}

function PitchRow({
  pitch,
  onEdit,
  onPreview,
  onPause,
  onRenew,
  onCopy,
  onDelete,
}) {
  const isActive = pitch.status === "active";
  const isExpired = pitch.status === "expired";

  const menuItems = [
    { label: "View pitch", icon: HiEye, onClick: onPreview },
    { label: "Edit details", icon: HiPencilAlt, onClick: onEdit },
    { label: "Copy link", icon: HiClipboard, onClick: onCopy },
    { divider: true },
    isExpired
      ? { label: "Renew (30 days)", icon: HiRefresh, onClick: onRenew }
      : isActive
        ? { label: "Pause pitch", icon: HiPause, onClick: onPause }
        : { label: "Resume pitch", icon: HiResume, onClick: onPause },
    { divider: true },
    { label: "Delete pitch", icon: HiTrash, onClick: onDelete, danger: true },
  ];

  return (
    <motion.div
      className="bg-card-bg/60 border-2 border-gold/15 rounded-2xl overflow-hidden"
      whileHover={{ y: -2 }}
    >
      <div className="flex flex-col sm:flex-row gap-4 p-4">
        <div className="relative w-full sm:w-44 h-44 sm:h-32 flex-shrink-0">
          <img
            src={pitch.thumbnailUrl}
            alt={pitch.title}
            className="w-full h-full object-cover rounded-xl"
          />
          <button
            onClick={onPreview}
            className="absolute inset-0 flex items-center justify-center bg-dark-navy/40 hover:bg-dark-navy/60 rounded-xl transition-colors group"
          >
            <div className="w-12 h-12 rounded-full bg-gold flex items-center justify-center group-hover:scale-110 transition-transform">
              <HiPlay className="w-6 h-6 text-dark-navy ml-0.5" />
            </div>
          </button>
          <span className="absolute top-2 right-2 px-2 py-0.5 bg-dark-navy/80 text-white text-[10px] font-bold rounded-full backdrop-blur">
            {pitch.duration}s
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
            <h3 className="text-lg font-bold">{pitch.title}</h3>
            <div className="flex items-center gap-2">
              <StatusPill status={pitch.status} />
              <DropdownMenu items={menuItems} />
            </div>
          </div>
          <p className="text-sm text-gray-400 mb-3 line-clamp-2">
            {pitch.description}
          </p>
          <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-4">
            <span className="flex items-center gap-1">
              <HiEye /> {pitch.views.toLocaleString()} views
            </span>
            <span className="flex items-center gap-1">
              <HiHeart /> {pitch.likes.length} likes
            </span>
            <span className="flex items-center gap-1">
              <HiBookmark /> {pitch.saves.length} saves
            </span>
            <span className="text-gold font-bold">
              {formatINR(pitch.askAmount)} · {pitch.equityOffered}%
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Action icon={HiPencilAlt} label="Edit" onClick={onEdit} />
            {isActive && (
              <Action icon={HiPause} label="Pause" onClick={onPause} />
            )}
            {!isActive && !isExpired && (
              <Action icon={HiResume} label="Resume" onClick={onPause} />
            )}
            {isExpired && (
              <Action
                icon={HiRefresh}
                label="Renew"
                accent="gold"
                onClick={onRenew}
              />
            )}
            <Link to="/app/analytics">
              <Action icon={HiChartBar} label="Analytics" />
            </Link>
            <Action
              icon={HiTrash}
              label="Delete"
              accent="red"
              onClick={onDelete}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function EditForm({ pitch, onSave, onCancel }) {
  const [data, setData] = useState({
    title: pitch.title,
    description: pitch.description,
    askAmount: pitch.askAmount,
    equityOffered: pitch.equityOffered,
  });
  const handle = (e) =>
    setData((p) => ({ ...p, [e.target.name]: e.target.value }));

  return (
    <div className="space-y-4">
      <FormField
        label="Title"
        name="title"
        value={data.title}
        onChange={handle}
      />
      <div>
        <label className="block text-sm font-semibold mb-2 text-gray-300">
          Description
        </label>
        <textarea
          name="description"
          value={data.description}
          onChange={handle}
          rows={3}
          className="w-full px-4 py-3 bg-dark-bg/60 border-2 border-gold/20 rounded-xl text-white placeholder-gray-500 focus:border-gold focus:outline-none resize-none"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FormField
          label="Ask (INR)"
          name="askAmount"
          type="number"
          value={data.askAmount}
          onChange={handle}
        />
        <FormField
          label="Equity (%)"
          name="equityOffered"
          type="number"
          value={data.equityOffered}
          onChange={handle}
        />
      </div>
      <div className="flex gap-3 pt-2">
        <button
          onClick={onCancel}
          className="flex-1 px-5 py-2.5 rounded-xl border-2 border-gold/20 hover:border-gold/50 font-bold text-sm"
        >
          Cancel
        </button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSave(data)}
          className="flex-1 px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-gold to-bright-gold text-dark-navy shadow-gold/30 shadow-lg"
        >
          Save changes
        </motion.button>
      </div>
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    active: "bg-emerald-500/15 text-emerald-400",
    paused: "bg-yellow-500/15 text-yellow-400",
    expired: "bg-red-500/15 text-red-400",
    processing: "bg-blue-500/15 text-blue-400",
    rejected: "bg-red-500/15 text-red-400",
  };
  return (
    <span
      className={`px-3 py-1 text-[11px] font-bold rounded-full uppercase ${
        map[status] || "bg-gray-700/40 text-gray-400"
      }`}
    >
      {status}
    </span>
  );
}

function Action({ icon: Icon, label, onClick, accent = "default" }) {
  const cls =
    accent === "gold"
      ? "border-gold/40 hover:border-gold text-gold"
      : accent === "red"
        ? "border-red-500/30 hover:border-red-500 text-red-400"
        : "border-gold/20 hover:border-gold/50 text-gray-300 hover:text-white";
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 border-2 ${cls} rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}
