import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  HiPlus,
  HiPencil,
  HiTrash,
  HiCurrencyDollar,
  HiTrendingUp,
  HiUserGroup,
  HiCalendar,
  HiRefresh,
} from "react-icons/hi";

import DashboardShell from "../../components/dashboard/DashboardShell";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { useToast } from "../../components/ui/Toast";
import { fundingService } from "../../services/fundingService";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function AdminFundingPage() {
  const toast = useToast();

  const [impactSummary, setImpactSummary] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

                      
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    fundingAmountCr: "",
    startupsFunded: "",
  });
  const [formSubmitting, setFormSubmitting] = useState(false);

                          
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(false);
    try {
      const [sumRes, recRes] = await Promise.all([
        fundingService.getImpact(),
        fundingService.getRecords(),
      ]);
      setImpactSummary(sumRes?.data?.data || sumRes?.data);
      setRecords(recRes?.data?.data || recRes?.data || []);
    } catch (err) {
      console.error("Error loading funding data", err);
      setError(true);
      toast.error("Failed to load funding records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingRecord(null);
    setFormData({
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      fundingAmountCr: "",
      startupsFunded: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (rec) => {
    setEditingRecord(rec);
    setFormData({
      month: rec.month,
      year: rec.year,
      fundingAmountCr: rec.fundingAmountCr,
      startupsFunded: rec.startupsFunded,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const monthNum = Number(formData.month);
    const yearNum = Number(formData.year);
    const amountNum = Number(formData.fundingAmountCr);
    const startupsNum = Number(formData.startupsFunded);

                 
    if (!monthNum || monthNum < 1 || monthNum > 12) {
      toast.error("Please select a valid month (1-12)");
      return;
    }
    if (!yearNum || yearNum < 2000 || yearNum > 2100) {
      toast.error("Please enter a valid 4-digit year");
      return;
    }
    if (isNaN(amountNum) || amountNum < 0) {
      toast.error("Funding amount must be a positive number or zero");
      return;
    }
    if (isNaN(startupsNum) || startupsNum < 0 || !Number.isInteger(startupsNum)) {
      toast.error("Startups funded must be a non-negative whole integer");
      return;
    }

    setFormSubmitting(true);
    try {
      const payload = {
        month: monthNum,
        year: yearNum,
        fundingAmountCr: amountNum,
        startupsFunded: startupsNum,
      };

      if (editingRecord) {
        await fundingService.updateMonthlyFunding(editingRecord._id, payload);
        toast.success("Funding record updated successfully");
      } else {
        await fundingService.createMonthlyFunding(payload);
        toast.success("Monthly funding record created successfully");
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save funding data");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await fundingService.deleteMonthlyFunding(deleteTarget._id);
      toast.success("Funding record deleted successfully");
      setDeleteTarget(null);
      loadData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete record");
    }
  };

  const current = impactSummary?.currentMonth;
  const previous = impactSummary?.previousMonth;

  return (
    <DashboardShell mode="admin">
      <div className="space-y-6">
        {            }
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#1B5E3F]/12 rounded-2xl p-6 shadow-sm">
          <div>
            <h1 className="text-2xl font-black text-[#0A1F14]">
              Funding Impact Management
            </h1>
            <p className="text-xs text-[#0A1F14]/60 mt-1">
              Manage monthly funding statistics displayed across EXPGLO FUND.
            </p>
          </div>
          <motion.button
            onClick={openAddModal}
            className="px-5 py-2.5 bg-[#1B5E3F] hover:bg-[#0F4A2E] text-white text-sm font-bold rounded-xl inline-flex items-center justify-center gap-2 shadow-md transition-colors shrink-0"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <HiPlus className="w-5 h-5" /> Add Monthly Funding
          </motion.button>
        </div>

        {                       }
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-white border border-[#1B5E3F]/12 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-[#F5B942]/15 text-[#0F4A2E] flex items-center justify-center">
                <HiCurrencyDollar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#0A1F14]/50 uppercase">Total Funding</p>
                <p className="text-xl font-black text-[#0F4A2E]">
                  ₹{impactSummary?.totalFundingCr ?? 0} Cr
                </p>
              </div>
            </div>
            <p className="text-[11px] text-[#0A1F14]/60">All-Time Cumulative Capital</p>
          </div>

          <div className="p-5 bg-white border border-[#1B5E3F]/12 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <HiUserGroup className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#0A1F14]/50 uppercase">Startups Funded</p>
                <p className="text-xl font-black text-[#0F4A2E]">
                  {impactSummary?.totalStartupsFunded ?? 0}
                </p>
              </div>
            </div>
            <p className="text-[11px] text-[#0A1F14]/60">All-Time Total Portfolio Count</p>
          </div>

          <div className="p-5 bg-white border border-[#1B5E3F]/12 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-[#1B5E3F]/10 text-[#1B5E3F] flex items-center justify-center">
                <HiTrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#0A1F14]/50 uppercase">Current Month</p>
                <p className="text-xl font-black text-[#0F4A2E]">
                  ₹{current ? current.fundingAmountCr : 0} Cr
                </p>
              </div>
            </div>
            <p className="text-[11px] text-[#0A1F14]/60">
              {current ? `${current.monthName} ${current.year}` : "No current record"}
            </p>
          </div>

          <div className="p-5 bg-white border border-[#1B5E3F]/12 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center">
                <HiCalendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#0A1F14]/50 uppercase">Previous Month</p>
                <p className="text-xl font-black text-[#0A1F14]">
                  ₹{previous ? previous.fundingAmountCr : 0} Cr
                </p>
              </div>
            </div>
            <p className="text-[11px] text-[#0A1F14]/60">
              {previous ? `${previous.monthName} ${previous.year}` : "No previous record"}
            </p>
          </div>
        </div>

        {                        }
        <div className="bg-white border border-[#1B5E3F]/12 rounded-2xl p-6 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between pb-4 border-b border-[#1B5E3F]/8">
            <h3 className="font-bold text-base text-[#0A1F14]">
              Monthly Funding Records
            </h3>
            <button
              onClick={loadData}
              className="px-3 py-1.5 bg-[#1B5E3F]/10 hover:bg-[#1B5E3F]/20 text-[#0F4A2E] text-xs font-bold rounded-lg inline-flex items-center gap-1 transition-colors"
            >
              <HiRefresh className="w-4 h-4" /> Refresh Table
            </button>
          </div>

          {loading ? (
            <div className="py-12 flex justify-center">
              <div className="w-8 h-8 rounded-full border-[3px] border-[#1B5E3F]/20 border-t-[#1B5E3F] animate-spin" />
            </div>
          ) : error ? (
            <div className="py-8 text-center text-xs text-red-500 font-semibold">
              Failed to load funding records.
            </div>
          ) : records.length === 0 ? (
            <div className="py-12 text-center text-sm text-[#0A1F14]/50">
              No monthly funding records created yet. Click "+ Add Monthly Funding" to add the first entry.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[#1B5E3F]/10 text-[11px] uppercase tracking-wider font-bold text-[#0A1F14]/50">
                    <th className="py-3 px-4">Month / Year</th>
                    <th className="py-3 px-4">Funding Amount</th>
                    <th className="py-3 px-4">Startups Funded</th>
                    <th className="py-3 px-4">Last Updated</th>
                    <th className="py-3 px-4">Updated By</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1B5E3F]/8">
                  {records.map((rec) => (
                    <tr
                      key={rec._id}
                      className="hover:bg-[#FAFAF7] transition-colors"
                    >
                      <td className="py-3.5 px-4 font-bold text-[#0A1F14]">
                        {rec.monthName} {rec.year}
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-[#0F4A2E]">
                        ₹{rec.fundingAmountCr} Cr
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#0A1F14]">
                        {rec.startupsFunded}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-[#0A1F14]/65">
                        {new Date(rec.updatedAt || rec.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-semibold text-[#0A1F14]/75">
                        {rec.updatedBy?.name || "Admin"}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => openEditModal(rec)}
                          className="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-1"
                        >
                          <HiPencil className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => setDeleteTarget(rec)}
                          className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-1"
                        >
                          <HiTrash className="w-3.5 h-3.5" /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {                           }
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRecord ? "Edit Monthly Funding Data" : "Add Monthly Funding Data"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#0A1F14] mb-1">
                Month *
              </label>
              <select
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                className="w-full px-3 py-2 bg-[#FAFAF7] border border-[#1B5E3F]/20 rounded-xl text-sm font-semibold text-[#0A1F14] focus:border-[#1B5E3F] focus:outline-none"
                required
              >
                {MONTH_NAMES.map((m, idx) => (
                  <option key={idx + 1} value={idx + 1}>
                    {m} ({idx + 1})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0A1F14] mb-1">
                Year *
              </label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                placeholder="2026"
                min="2000"
                max="2100"
                className="w-full px-3 py-2 bg-[#FAFAF7] border border-[#1B5E3F]/20 rounded-xl text-sm font-semibold text-[#0A1F14] focus:border-[#1B5E3F] focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0A1F14] mb-1">
              Funding Amount (₹ Crores) *
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.fundingAmountCr}
              onChange={(e) => setFormData({ ...formData, fundingAmountCr: e.target.value })}
              placeholder="e.g. 18.5"
              min="0"
              className="w-full px-3 py-2 bg-[#FAFAF7] border border-[#1B5E3F]/20 rounded-xl text-sm font-semibold text-[#0A1F14] focus:border-[#1B5E3F] focus:outline-none"
              required
            />
            <p className="text-[11px] text-[#0A1F14]/50 mt-1">
              Funding amount is stored in ₹ Crores (e.g. enter 18.5 for ₹18.5 Cr).
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0A1F14] mb-1">
              Startups Funded *
            </label>
            <input
              type="number"
              step="1"
              value={formData.startupsFunded}
              onChange={(e) => setFormData({ ...formData, startupsFunded: e.target.value })}
              placeholder="e.g. 12"
              min="0"
              className="w-full px-3 py-2 bg-[#FAFAF7] border border-[#1B5E3F]/20 rounded-xl text-sm font-semibold text-[#0A1F14] focus:border-[#1B5E3F] focus:outline-none"
              required
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#1B5E3F]/10">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-[#1B5E3F]/20 hover:bg-[#FAFAF7] text-xs font-bold text-[#0A1F14] rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formSubmitting}
              className="px-5 py-2 bg-[#1B5E3F] hover:bg-[#0F4A2E] text-white text-xs font-bold rounded-xl shadow-md transition-colors disabled:opacity-50"
            >
              {formSubmitting ? "Saving..." : "Save Funding Data"}
            </button>
          </div>
        </form>
      </Modal>

      {                                }
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Monthly Funding Record?"
        message={`Are you sure you want to delete the record for ${
          deleteTarget ? deleteTarget.monthName : ""
        } ${deleteTarget?.year}? This will recalculate platform funding impact.`}
        confirmText="Delete Record"
      />
    </DashboardShell>
  );
}
