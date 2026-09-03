import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { HiCheck, HiX, HiFlag, HiBan, HiTrash } from "react-icons/hi";

import DashboardShell from "../../components/dashboard/DashboardShell";
import DropdownMenu from "../../components/ui/DropdownMenu";
import Modal from "../../components/ui/Modal";
import { useToast } from "../../components/ui/Toast";
import { adminService } from "../../services/adminService";

const typeColor = {
  spam: "bg-yellow-500/15 text-yellow-400",
  fake: "bg-orange-500/15 text-orange-400",
  scam: "bg-red-500/15 text-red-400",
  inappropriate: "bg-purple-500/15 text-purple-400",
  harassment: "bg-red-500/15 text-red-400",
  other: "bg-gray-500/15 text-gray-400",
};

function fmtTime(d) {
  if (!d) return "";
  const diff = Math.max(0, Date.now() - new Date(d).getTime());
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

export default function AdminReportsPage() {
  const toast = useToast();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(null);

  const fetchReports = () => {
    setLoading(true);
    adminService
      .listReports({ limit: 100 })
      .then((res) => {
        const data = res?.data?.data || res?.data;
        const list = data?.reports || data || [];
        setReports(Array.isArray(list) ? list : []);
      })
      .catch(() => setReports([]))
      .finally(() => setLoading(false));
  };

  useEffect(fetchReports, []);

                                                                         
  const resolve = (report, { actionTaken, banUser, removeContent } = {}) => {
    const id = report._id;
    setReports((p) =>
      p.map((r) =>
        r._id === id
          ? { ...r, status: "resolved", actionTaken: actionTaken || "handled" }
          : r,
      ),
    );

    adminService
      .resolveReport(id, { actionTaken: actionTaken || "handled" })
      .catch(() => {});

                                 
    if (banUser) {
      const uid = report.reportedUser?._id || report.reportedUser;
      if (uid)
        adminService.banUser(uid, `Report: ${report.type}`).catch(() => {});
    }
    if (removeContent) {
      const vid = report.reportedVideo?._id || report.reportedVideo;
      if (vid) adminService.deleteVideo(vid).catch(() => {});
    }

    toast.success(`Report resolved · ${actionTaken || "handled"}`);
  };

  const dismiss = (report) => {
    const id = report._id;
    setReports((p) =>
      p.map((r) => (r._id === id ? { ...r, status: "dismissed" } : r)),
    );
    adminService
      .resolveReport(id, { status: "dismissed", actionTaken: "dismissed" })
      .catch(() => {});
    toast.info("Report dismissed");
  };

  const pendingCount = reports.filter((r) => r.status === "pending").length;

  return (
    <DashboardShell
      mode="admin"
      title="Reports queue"
      subtitle={`${pendingCount} pending`}
    >
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-[3px] border-gold/20 border-t-gold animate-spin" />
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <HiFlag className="w-12 h-12 text-gold/40 mx-auto mb-3" />
          No reports. The community is behaving.
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => {
            const targetName =
              r.reportedUser?.name || r.reportedVideo?.title || "Unknown";
            const targetType = r.reportedVideo ? "video" : "user";
            const reporter = r.reportedBy?.name || "A user";
            return (
              <motion.div
                key={r._id}
                className={`bg-card-bg/60 border-2 rounded-2xl p-5 ${
                  r.status === "pending"
                    ? "border-red-500/30"
                    : "border-gold/15"
                }`}
                whileHover={{ y: -2 }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center flex-shrink-0">
                    <HiFlag className="w-5 h-5 text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span
                        className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase ${typeColor[r.type] || typeColor.other}`}
                      >
                        {r.type}
                      </span>
                      <span className="text-xs text-gray-400 capitalize">
                        {targetType}: {targetName}
                      </span>
                      <span className="text-xs text-gray-500 ml-auto">
                        {fmtTime(r.createdAt)}
                      </span>
                    </div>
                    {r.description && (
                      <p className="text-sm text-gray-300 mb-2">
                        "{r.description}"
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mb-3">
                      Reported by {reporter}
                    </p>
                    {r.status === "pending" ? (
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => setViewing(r)}
                          className="px-4 py-2 border-2 border-gold/20 hover:border-gold rounded-lg text-xs font-bold"
                        >
                          Review
                        </button>
                        <button
                          onClick={() =>
                            resolve(r, { actionTaken: "no action needed" })
                          }
                          className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-xs font-bold flex items-center gap-1.5"
                        >
                          <HiCheck /> Resolve
                        </button>
                        <button
                          onClick={() => dismiss(r)}
                          className="px-4 py-2 bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 rounded-lg text-xs font-bold flex items-center gap-1.5"
                        >
                          <HiX /> Dismiss
                        </button>
                        <DropdownMenu
                          items={[
                            r.reportedUser && {
                              label: "Resolve · ban user",
                              icon: HiBan,
                              onClick: () =>
                                resolve(r, {
                                  actionTaken: "user banned",
                                  banUser: true,
                                }),
                              danger: true,
                            },
                            r.reportedVideo && {
                              label: "Resolve · remove content",
                              icon: HiTrash,
                              onClick: () =>
                                resolve(r, {
                                  actionTaken: "content removed",
                                  removeContent: true,
                                }),
                              danger: true,
                            },
                          ].filter(Boolean)}
                        />
                      </div>
                    ) : (
                      <span
                        className={`text-xs font-bold ${
                          r.status === "dismissed"
                            ? "text-gray-500"
                            : "text-emerald-400"
                        }`}
                      >
                        ●{" "}
                        {r.status === "dismissed"
                          ? "Dismissed"
                          : `Resolved · ${r.actionTaken || "handled"}`}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <Modal
        open={!!viewing}
        onClose={() => setViewing(null)}
        title="Report details"
      >
        {viewing && (
          <div className="space-y-3">
            <Field label="Type" value={viewing.type} />
            <Field
              label="Target"
              value={
                viewing.reportedVideo?.title ||
                viewing.reportedUser?.name ||
                "Unknown"
              }
            />
            <Field
              label="Reported by"
              value={viewing.reportedBy?.name || "A user"}
            />
            <Field label="Submitted" value={fmtTime(viewing.createdAt)} />
            {viewing.description && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Description</p>
                <p className="bg-dark-bg/40 p-3 rounded-xl text-sm">
                  {viewing.description}
                </p>
              </div>
            )}
            <div className="flex gap-2 pt-2 flex-wrap">
              <button
                onClick={() => {
                  resolve(viewing, { actionTaken: "no action needed" });
                  setViewing(null);
                }}
                className="flex-1 px-4 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-xl font-bold text-sm"
              >
                Resolve
              </button>
              {viewing.reportedUser && (
                <button
                  onClick={() => {
                    resolve(viewing, {
                      actionTaken: "user banned",
                      banUser: true,
                    });
                    setViewing(null);
                  }}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm"
                >
                  Ban user
                </button>
              )}
              {viewing.reportedVideo && (
                <button
                  onClick={() => {
                    resolve(viewing, {
                      actionTaken: "content removed",
                      removeContent: true,
                    });
                    setViewing(null);
                  }}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm"
                >
                  Remove content
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </DashboardShell>
  );
}

function Field({ label, value }) {
  return (
    <div className="flex justify-between p-3 bg-dark-bg/40 rounded-xl">
      <span className="text-sm text-gray-400">{label}</span>
      <span className="font-bold capitalize text-sm">{value}</span>
    </div>
  );
}
