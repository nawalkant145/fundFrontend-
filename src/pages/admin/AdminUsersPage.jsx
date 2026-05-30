import { useState } from "react";
import { motion } from "framer-motion";
import {
  HiSearch,
  HiBan,
  HiCheck,
  HiPencilAlt,
  HiEye,
  HiTrash,
  HiKey,
  HiShieldCheck,
} from "react-icons/hi";
import { MdVerified } from "react-icons/md";

import DashboardShell from "../../components/dashboard/DashboardShell";
import DropdownMenu from "../../components/ui/DropdownMenu";
import Modal from "../../components/ui/Modal";
import Confirm from "../../components/ui/Confirm";
import { useToast } from "../../components/ui/Toast";

const SEED = [
  {
    _id: "u1",
    name: "Aisha Kamara",
    email: "aisha@novamed.ai",
    role: "founder",
    isVerified: true,
    isBanned: false,
    createdAt: "May 14",
    avatar:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop",
    company: "NovaMed AI",
  },
  {
    _id: "u2",
    name: "Vikram Patel",
    email: "vikram@altva.com",
    role: "investor",
    isVerified: true,
    isBanned: false,
    createdAt: "Apr 22",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop",
    company: "Altva Capital",
  },
  {
    _id: "u3",
    name: "Karan Mehta",
    email: "karan@tempmail.com",
    role: "investor",
    isVerified: false,
    isBanned: true,
    createdAt: "May 24",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop",
    company: "—",
  },
  {
    _id: "u4",
    name: "Sofia Chen",
    email: "sofia@eduforge.in",
    role: "founder",
    isVerified: false,
    isBanned: false,
    createdAt: "May 26",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    company: "EduForge",
  },
];

export default function AdminUsersPage() {
  const toast = useToast();
  const [users, setUsers] = useState(SEED);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [viewing, setViewing] = useState(null);
  const [banning, setBanning] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const filtered = users.filter((u) => {
    if (filter === "founders" && u.role !== "founder") return false;
    if (filter === "investors" && u.role !== "investor") return false;
    if (filter === "banned" && !u.isBanned) return false;
    if (filter === "unverified" && u.isVerified) return false;
    if (
      query &&
      !`${u.name} ${u.email} ${u.company}`
        .toLowerCase()
        .includes(query.toLowerCase())
    )
      return false;
    return true;
  });

  const ban = (id, reason) => {
    setUsers((p) =>
      p.map((x) =>
        x._id === id ? { ...x, isBanned: true, banReason: reason } : x,
      ),
    );
    toast.warn("User banned");
  };
  const unban = (id) => {
    setUsers((p) =>
      p.map((x) => (x._id === id ? { ...x, isBanned: false } : x)),
    );
    toast.success("User unbanned");
  };
  const verify = (id) => {
    setUsers((p) =>
      p.map((x) => (x._id === id ? { ...x, isVerified: true } : x)),
    );
    toast.success("Verification granted");
  };
  const remove = (id) => {
    setUsers((p) => p.filter((x) => x._id !== id));
    toast.success("User permanently deleted");
  };
  const resetPw = () => toast.success("Password reset link sent");

  return (
    <DashboardShell
      mode="admin"
      title="Users"
      subtitle={`${filtered.length} users`}
    >
      <div className="bg-card-bg/60 border-2 border-gold/15 rounded-2xl p-4 mb-5">
        <div className="relative mb-3">
          <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email, company…"
            className="w-full pl-12 pr-4 py-3 bg-dark-bg/60 border border-gold/15 rounded-xl text-white placeholder-gray-500 focus:border-gold focus:outline-none"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { v: "all", l: "All" },
            { v: "founders", l: "Founders" },
            { v: "investors", l: "Investors" },
            { v: "unverified", l: "Unverified" },
            { v: "banned", l: "Banned" },
          ].map((f) => (
            <button
              key={f.v}
              onClick={() => setFilter(f.v)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                filter === f.v
                  ? "bg-gold text-dark-navy"
                  : "bg-dark-bg/60 text-gray-300 border border-gold/20 hover:border-gold/50"
              }`}
            >
              {f.l}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card-bg/60 border-2 border-gold/15 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-dark-bg/60 border-b border-gold/10">
              <tr className="text-left text-xs uppercase tracking-wider text-gray-400">
                <th className="p-4 font-bold">User</th>
                <th className="p-4 font-bold">Role</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold">Joined</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/10">
              {filtered.map((u) => (
                <tr key={u._id} className="hover:bg-dark-bg/40">
                  <td className="p-4">
                    <button
                      onClick={() => setViewing(u)}
                      className="flex items-center gap-3 text-left"
                    >
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-10 h-10 rounded-full object-cover border border-gold/20"
                      />
                      <div className="min-w-0">
                        <p className="font-bold flex items-center gap-1">
                          {u.name}
                          {u.isVerified && (
                            <MdVerified className="w-4 h-4 text-gold" />
                          )}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {u.email} · {u.company}
                        </p>
                      </div>
                    </button>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                        u.role === "founder"
                          ? "bg-gold/15 text-gold"
                          : "bg-primary-green/15 text-primary-green"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4">
                    {u.isBanned ? (
                      <span className="text-red-400 text-xs font-bold">
                        ● Banned
                      </span>
                    ) : u.isVerified ? (
                      <span className="text-emerald-400 text-xs font-bold">
                        ● Verified
                      </span>
                    ) : (
                      <span className="text-yellow-400 text-xs font-bold">
                        ● Unverified
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-gray-400 text-xs">{u.createdAt}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-1">
                      <IconBtn
                        icon={HiEye}
                        title="View"
                        onClick={() => setViewing(u)}
                      />
                      {u.isBanned ? (
                        <IconBtn
                          icon={HiCheck}
                          title="Unban"
                          accent="green"
                          onClick={() => unban(u._id)}
                        />
                      ) : (
                        <IconBtn
                          icon={HiBan}
                          title="Ban"
                          accent="red"
                          onClick={() => setBanning(u)}
                        />
                      )}
                      <DropdownMenu
                        items={[
                          {
                            label: "View profile",
                            icon: HiEye,
                            onClick: () => setViewing(u),
                          },
                          {
                            label: "Edit user",
                            icon: HiPencilAlt,
                            onClick: () => toast.info("Edit form opening soon"),
                          },
                          {
                            label: "Reset password",
                            icon: HiKey,
                            onClick: resetPw,
                          },
                          !u.isVerified && {
                            label: "Grant blue tick",
                            icon: HiShieldCheck,
                            onClick: () => verify(u._id),
                          },
                          { divider: true },
                          {
                            label: "Delete permanently",
                            icon: HiTrash,
                            onClick: () => setDeleting(u),
                            danger: true,
                          },
                        ].filter(Boolean)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View modal */}
      <Modal
        open={!!viewing}
        onClose={() => setViewing(null)}
        title="User details"
      >
        {viewing && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <img
                src={viewing.avatar}
                alt={viewing.name}
                className="w-16 h-16 rounded-full border-2 border-gold/40"
              />
              <div>
                <p className="font-bold text-lg flex items-center gap-1">
                  {viewing.name}
                  {viewing.isVerified && (
                    <MdVerified className="w-5 h-5 text-gold" />
                  )}
                </p>
                <p className="text-sm text-gray-400">{viewing.email}</p>
              </div>
            </div>
            <Field label="Role" value={viewing.role} />
            <Field label="Company" value={viewing.company} />
            <Field label="Joined" value={viewing.createdAt} />
            <Field
              label="Status"
              value={viewing.isBanned ? "Banned" : "Active"}
            />
          </div>
        )}
      </Modal>

      {/* Ban reason modal */}
      <BanModal
        user={banning}
        onClose={() => setBanning(null)}
        onConfirm={(reason) => ban(banning._id, reason)}
      />

      {/* Delete confirm */}
      <Confirm
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => remove(deleting._id)}
        title={`Permanently delete ${deleting?.name}?`}
        message="All their content, chats, and pitches will be deleted. This cannot be undone."
        confirmLabel="Delete user"
        destructive
      />
    </DashboardShell>
  );
}

function BanModal({ user, onClose, onConfirm }) {
  const [reason, setReason] = useState("");
  if (!user) return null;
  return (
    <Modal open={!!user} onClose={onClose} title={`Ban ${user.name}?`}>
      <p className="text-sm text-gray-300 mb-3">
        They will lose access immediately. Their pitches will be removed from
        the feed.
      </p>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={3}
        placeholder="Reason for ban (visible in audit log)…"
        className="w-full px-4 py-3 bg-dark-bg/60 border-2 border-gold/20 rounded-xl text-white placeholder-gray-500 focus:border-gold focus:outline-none resize-none mb-3"
      />
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2.5 border-2 border-gold/20 hover:border-gold/50 rounded-xl font-bold text-sm"
        >
          Cancel
        </button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            onConfirm(reason);
            onClose();
          }}
          className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm"
        >
          Ban user
        </motion.button>
      </div>
    </Modal>
  );
}

function Field({ label, value }) {
  return (
    <div className="flex justify-between p-3 bg-dark-bg/40 rounded-xl">
      <span className="text-sm text-gray-400">{label}</span>
      <span className="font-bold capitalize">{value}</span>
    </div>
  );
}

function IconBtn({ icon: Icon, title, accent, onClick }) {
  const cls =
    accent === "red"
      ? "text-red-400 hover:bg-red-500/15"
      : accent === "green"
        ? "text-emerald-400 hover:bg-emerald-500/15"
        : "text-gray-400 hover:text-white hover:bg-dark-bg/60";
  return (
    <motion.button
      title={title}
      onClick={onClick}
      className={`p-2 rounded-lg transition-colors ${cls}`}
      whileHover={{ scale: 1.1 }}
    >
      <Icon className="w-4 h-4" />
    </motion.button>
  );
}
