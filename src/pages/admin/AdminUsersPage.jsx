import { useEffect, useState } from "react";
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
  HiArrowUp,
  HiClock,
} from "react-icons/hi";
import { MdVerified } from "react-icons/md";

import DashboardShell from "../../components/dashboard/DashboardShell";
import DropdownMenu from "../../components/ui/DropdownMenu";
import Modal from "../../components/ui/Modal";
import Confirm from "../../components/ui/Confirm";
import { useToast } from "../../components/ui/Toast";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { adminService } from "../../services/adminService";

export default function AdminUsersPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const { startImpersonation } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [viewing, setViewing] = useState(null);
  const [banning, setBanning] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [editing, setEditing] = useState(null);
  const [resetting, setResetting] = useState(null);
  const [promoting, setPromoting] = useState(null);
  const [suspending, setSuspending] = useState(null);
  const [selected, setSelected] = useState(new Set());

                               
  const fetchUsers = () => {
    setLoading(true);
    const params = { limit: 50 };
    if (filter === "founders") params.role = "founder";
    if (filter === "investors") params.role = "investor";
    if (filter === "admins") params.role = "admin";
    if (filter === "banned") params.status = "banned";
    if (filter === "unverified") params.verified = "false";
    if (query) params.search = query;

    adminService
      .listUsers(params)
      .then((res) => {
        const data = res?.data?.data || res?.data;
        const list = data?.users || data || [];
        setUsers(Array.isArray(list) ? list : []);
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };

                                           
  useEffect(() => {
    const t = setTimeout(fetchUsers, query ? 400 : 0);
    return () => clearTimeout(t);
                               
  }, [filter, query]);

  const ban = (id, reason) => {
    setUsers((p) =>
      p.map((x) =>
        x._id === id ? { ...x, isBanned: true, banReason: reason } : x,
      ),
    );
    adminService.banUser(id, reason).catch(() => {});
    toast.warn("User banned");
  };
  const unban = (id) => {
    setUsers((p) =>
      p.map((x) => (x._id === id ? { ...x, isBanned: false } : x)),
    );
    adminService.unbanUser(id).catch(() => {});
    toast.success("User unbanned");
  };
  const verify = (id) => {
    setUsers((p) =>
      p.map((x) => (x._id === id ? { ...x, isVerified: true } : x)),
    );
    adminService.editUser(id, { isVerified: true }).catch(() => {});
    toast.success("Verification granted");
  };
  const remove = (id) => {
    setUsers((p) => p.filter((x) => x._id !== id));
    adminService.deleteUser(id).catch(() => {});
    toast.success("User permanently deleted");
  };
  const resetPw = (id, newPassword) => {
    adminService
      .resetUserPassword(id, newPassword)
      .then(() => toast.success("Password reset"))
      .catch(() => toast.error("Failed to reset password"));
  };
  const promote = (id) => {
    setUsers((p) => p.map((x) => (x._id === id ? { ...x, role: "admin" } : x)));
    adminService.promoteToAdmin(id).catch(() => {});
    toast.success("User promoted to admin");
  };
  const saveEdit = (id, changes) => {
    setUsers((p) => p.map((x) => (x._id === id ? { ...x, ...changes } : x)));
    adminService
      .editUser(id, changes)
      .then(() => toast.success("User updated"))
      .catch(() => toast.error("Update failed"));
  };

  const impersonate = async (u) => {
    try {
      const res = await adminService.impersonateUser(u._id);
      const data = res?.data?.data || res?.data;
      if (data?.token) {
        startImpersonation(data.token, data.user || u);
        navigate("/app");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Impersonation failed");
    }
  };

                          
  const revokeVerified = (id) => {
    setUsers((p) =>
      p.map((x) => (x._id === id ? { ...x, isVerified: false } : x)),
    );
    adminService.editUser(id, { isVerified: false }).catch(() => {});
    toast.info("Verified badge revoked");
  };

                                                
  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const selectAll = () => {
    if (selected.size === users.length) setSelected(new Set());
    else setSelected(new Set(users.map((u) => u._id)));
  };
  const bulkBan = () => {
    selected.forEach((id) => {
      adminService.banUser(id, "Bulk ban").catch(() => {});
    });
    setUsers((p) =>
      p.map((x) => (selected.has(x._id) ? { ...x, isBanned: true } : x)),
    );
    toast.warn(`${selected.size} users banned`);
    setSelected(new Set());
  };
  const bulkDelete = () => {
    selected.forEach((id) => {
      adminService.deleteUser(id).catch(() => {});
    });
    setUsers((p) => p.filter((x) => !selected.has(x._id)));
    toast.success(`${selected.size} users deleted`);
    setSelected(new Set());
  };
  const bulkVerify = () => {
    selected.forEach((id) => {
      adminService.editUser(id, { isVerified: true }).catch(() => {});
    });
    setUsers((p) =>
      p.map((x) => (selected.has(x._id) ? { ...x, isVerified: true } : x)),
    );
    toast.success(`${selected.size} users verified`);
    setSelected(new Set());
  };

  const suspend = (id, days, reason) => {
    const until = new Date(Date.now() + days * 86400000).toISOString();
    setUsers((p) =>
      p.map((x) =>
        x._id === id
          ? { ...x, suspendedUntil: until, suspensionReason: reason }
          : x,
      ),
    );
    adminService.suspendUser(id, days, reason).catch(() => {});
    toast.warn(`User suspended for ${days} day(s)`);
  };
  const unsuspend = (id) => {
    setUsers((p) =>
      p.map((x) => (x._id === id ? { ...x, suspendedUntil: null } : x)),
    );
    adminService.unsuspendUser(id).catch(() => {});
    toast.success("Suspension lifted");
  };

  const isSuspended = (u) =>
    u.suspendedUntil && new Date(u.suspendedUntil) > new Date();

  const fmtDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      : "—";

  return (
    <DashboardShell
      mode="admin"
      title="Users"
      subtitle={`${users.length} users`}
    >
      <div className="bg-card-bg/60 border-2 border-gold/15 rounded-2xl p-4 mb-5">
        <div className="relative mb-3">
          <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email, company, phone…"
            className="w-full pl-12 pr-4 py-3 bg-dark-bg/60 border border-gold/15 rounded-xl text-white placeholder-gray-500 focus:border-gold focus:outline-none"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { v: "all", l: "All" },
            { v: "founders", l: "Founders" },
            { v: "investors", l: "Investors" },
            { v: "admins", l: "Admins" },
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

      {                         }
      {selected.size > 0 && (
        <div className="bg-gold/10 border-2 border-gold/30 rounded-2xl p-3 mb-4 flex items-center gap-3 flex-wrap">
          <span className="text-sm font-bold text-gold">
            {selected.size} selected
          </span>
          <button
            onClick={bulkVerify}
            className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold"
          >
            Verify all
          </button>
          <button
            onClick={bulkBan}
            className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-xs font-bold"
          >
            Ban all
          </button>
          <button
            onClick={bulkDelete}
            className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold"
          >
            Delete all
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="px-3 py-1.5 border border-gold/20 rounded-lg text-xs font-bold text-gray-300"
          >
            Clear
          </button>
        </div>
      )}

      <div className="bg-card-bg/60 border-2 border-gold/15 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-dark-bg/60 border-b border-gold/10">
              <tr className="text-left text-xs uppercase tracking-wider text-gray-400">
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    checked={
                      selected.size > 0 && selected.size === users.length
                    }
                    onChange={selectAll}
                    className="accent-gold"
                  />
                </th>
                <th className="p-4 font-bold">User</th>
                <th className="p-4 font-bold">Role</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold">Joined</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/10">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center">
                    <div className="inline-block w-7 h-7 rounded-full border-[3px] border-gold/20 border-t-gold animate-spin" />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-gray-400">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className="hover:bg-dark-bg/40">
                    <td className="p-4 w-10">
                      <input
                        type="checkbox"
                        checked={selected.has(u._id)}
                        onChange={() => toggleSelect(u._id)}
                        className="accent-gold"
                      />
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => setViewing(u)}
                        className="flex items-center gap-3 text-left"
                      >
                        <img
                          src={
                            u.avatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || "U")}&background=1B5E3F&color=fff`
                          }
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
                            {u.email}
                            {u.companyName ? ` · ${u.companyName}` : ""}
                          </p>
                        </div>
                      </button>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                          u.role === "founder"
                            ? "bg-gold/15 text-gold"
                            : u.role === "admin"
                              ? "bg-purple-500/15 text-purple-400"
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
                      ) : isSuspended(u) ? (
                        <span className="text-orange-400 text-xs font-bold">
                          ● Suspended
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
                    <td className="p-4 text-gray-400 text-xs">
                      {fmtDate(u.createdAt)}
                    </td>
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
                              onClick: () => setEditing(u),
                            },
                            {
                              label: "Reset password",
                              icon: HiKey,
                              onClick: () => setResetting(u),
                            },
                            isSuspended(u)
                              ? {
                                  label: "Lift suspension",
                                  icon: HiCheck,
                                  onClick: () => unsuspend(u._id),
                                }
                              : {
                                  label: "Suspend temporarily",
                                  icon: HiClock,
                                  onClick: () => setSuspending(u),
                                },
                            !u.isVerified && {
                              label: "Grant blue tick",
                              icon: HiShieldCheck,
                              onClick: () => verify(u._id),
                            },
                            u.isVerified && {
                              label: "Revoke blue tick",
                              icon: HiShieldCheck,
                              onClick: () => revokeVerified(u._id),
                              danger: true,
                            },
                            u.role !== "admin" && {
                              label: "Promote to admin",
                              icon: HiArrowUp,
                              onClick: () => setPromoting(u),
                            },
                            u.role !== "admin" && {
                              label: "View as this user",
                              icon: HiEye,
                              onClick: () => impersonate(u),
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {                }
      <Modal
        open={!!viewing}
        onClose={() => setViewing(null)}
        title="User details"
      >
        {viewing && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <img
                src={
                  viewing.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(viewing.name || "U")}&background=1B5E3F&color=fff`
                }
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
            <Field label="Company" value={viewing.companyName || "—"} />
            <Field label="Phone" value={viewing.phone || "—"} />
            <Field label="Joined" value={fmtDate(viewing.createdAt)} />
            <Field
              label="Status"
              value={viewing.isBanned ? "Banned" : "Active"}
            />
            {viewing.banReason && (
              <Field label="Ban reason" value={viewing.banReason} />
            )}
            {viewing.lastLoginIp && (
              <Field label="Last login IP" value={viewing.lastLoginIp} />
            )}
            {viewing.lastLoginUserAgent && (
              <Field
                label="Last device"
                value={
                  viewing.lastLoginUserAgent.length > 80
                    ? viewing.lastLoginUserAgent.slice(0, 80) + "…"
                    : viewing.lastLoginUserAgent
                }
              />
            )}
            {viewing.lastLoginAt && (
              <Field
                label="Last login"
                value={new Date(viewing.lastLoginAt).toLocaleString()}
              />
            )}
          </div>
        )}
      </Modal>

      {                }
      <EditModal
        user={editing}
        onClose={() => setEditing(null)}
        onSave={(changes) => saveEdit(editing._id, changes)}
      />

      {                          }
      <ResetModal
        user={resetting}
        onClose={() => setResetting(null)}
        onConfirm={(pw) => resetPw(resetting._id, pw)}
      />

      {                      }
      <BanModal
        user={banning}
        onClose={() => setBanning(null)}
        onConfirm={(reason) => ban(banning._id, reason)}
      />

      {                   }
      <SuspendModal
        user={suspending}
        onClose={() => setSuspending(null)}
        onConfirm={(days, reason) => suspend(suspending._id, days, reason)}
      />

      {                     }
      <Confirm
        open={!!promoting}
        onClose={() => setPromoting(null)}
        onConfirm={() => promote(promoting._id)}
        title={`Promote ${promoting?.name} to admin?`}
        message="They will gain full admin access to the platform. Only do this for trusted team members."
        confirmLabel="Promote to admin"
      />

      {                    }
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

function EditModal({ user, onClose, onSave }) {
  const [form, setForm] = useState({});
  useEffect(() => {
    if (user)
      setForm({
        name: user.name || "",
        phone: user.phone || "",
        companyName: user.companyName || "",
        role: user.role || "founder",
        isVerified: !!user.isVerified,
      });
  }, [user]);
  if (!user) return null;
  const upd = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  return (
    <Modal open={!!user} onClose={onClose} title={`Edit ${user.name}`}>
      <div className="space-y-3">
        <Input
          label="Name"
          value={form.name}
          onChange={(v) => upd("name", v)}
        />
        <Input
          label="Phone"
          value={form.phone}
          onChange={(v) => upd("phone", v)}
        />
        <Input
          label="Company"
          value={form.companyName}
          onChange={(v) => upd("companyName", v)}
        />
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Role</label>
          <select
            value={form.role}
            onChange={(e) => upd("role", e.target.value)}
            className="w-full px-4 py-2.5 bg-dark-bg/60 border-2 border-gold/20 rounded-xl text-white focus:border-gold focus:outline-none"
          >
            <option value="founder">Founder</option>
            <option value="investor">Investor</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={form.isVerified}
            onChange={(e) => upd("isVerified", e.target.checked)}
          />
          Verified (blue tick)
        </label>
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border-2 border-gold/20 hover:border-gold/50 rounded-xl font-bold text-sm"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave(form);
              onClose();
            }}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-gold to-bright-gold text-dark-navy rounded-xl font-bold text-sm"
          >
            Save changes
          </button>
        </div>
      </div>
    </Modal>
  );
}

function ResetModal({ user, onClose, onConfirm }) {
  const [pw, setPw] = useState("");
  if (!user) return null;
  return (
    <Modal
      open={!!user}
      onClose={onClose}
      title={`Reset password — ${user.name}`}
    >
      <p className="text-sm text-gray-300 mb-3">
        Set a new password for this user. They'll be logged out everywhere.
      </p>
      <input
        type="text"
        value={pw}
        onChange={(e) => setPw(e.target.value)}
        placeholder="New password (min 8 chars)"
        className="w-full px-4 py-3 bg-dark-bg/60 border-2 border-gold/20 rounded-xl text-white placeholder-gray-500 focus:border-gold focus:outline-none mb-3"
      />
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2.5 border-2 border-gold/20 hover:border-gold/50 rounded-xl font-bold text-sm"
        >
          Cancel
        </button>
        <button
          disabled={pw.length < 8}
          onClick={() => {
            onConfirm(pw);
            onClose();
          }}
          className={`flex-1 px-4 py-2.5 rounded-xl font-bold text-sm ${
            pw.length >= 8
              ? "bg-gradient-to-r from-gold to-bright-gold text-dark-navy"
              : "bg-dark-bg/60 text-gray-500 cursor-not-allowed"
          }`}
        >
          Reset password
        </button>
      </div>
    </Modal>
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

function SuspendModal({ user, onClose, onConfirm }) {
  const [days, setDays] = useState(7);
  const [reason, setReason] = useState("");
  if (!user) return null;
  return (
    <Modal open={!!user} onClose={onClose} title={`Suspend ${user.name}`}>
      <p className="text-sm text-gray-300 mb-3">
        Temporarily blocks access. The account auto-unlocks when the period
        ends.
      </p>
      <div className="flex gap-2 mb-3">
        {[1, 3, 7, 14, 30].map((d) => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs border-2 transition-all ${
              days === d
                ? "border-gold bg-gold/10 text-gold"
                : "border-gold/15 hover:border-gold/40"
            }`}
          >
            {d}d
          </button>
        ))}
      </div>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={2}
        placeholder="Reason (shown to the user)…"
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
            onConfirm(days, reason);
            onClose();
          }}
          className="flex-1 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-sm"
        >
          Suspend {days}d
        </button>
      </div>
    </Modal>
  );
}

function Input({ label, value, onChange }) {
  return (
    <div>
      <label className="text-xs text-gray-400 mb-1 block">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 bg-dark-bg/60 border-2 border-gold/20 rounded-xl text-white focus:border-gold focus:outline-none"
      />
    </div>
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
