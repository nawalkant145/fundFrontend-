import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiCalendar, HiPlus, HiLocationMarker, HiUsers, HiTrash, HiArrowRight } from "react-icons/hi";
import { MdVerified } from "react-icons/md";
import DashboardShell from "../../components/dashboard/DashboardShell";
import Modal from "../../components/ui/Modal";
import { useToast } from "../../components/ui/Toast";
import { eventService } from "../../services/eventService";

function RegisteredUsersModal({ open, onClose, event }) {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchRegistrations = () => {
    if (!event?._id) return;
    setLoading(true);
    setError(false);

    eventService
      .getEventRegistrations(event._id, { limit: 50 })
      .then((res) => {
        const data = res?.data?.data || res?.data;
        const list = data?.registrations || (Array.isArray(data) ? data : []);
        setRegistrations(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        setError(true);
        setRegistrations([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (open && event?._id) {
      fetchRegistrations();
    }
  }, [open, event]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <div className="flex flex-col">
          <span className="font-bold text-sm text-[#0A1F14]">Registered Users</span>
          <span className="text-xs font-normal text-[#0A1F14]/60 truncate">
            {event?.title} • {registrations.length} {registrations.length === 1 ? "registrant" : "registrants"}
          </span>
        </div>
      }
      maxWidth="max-w-md"
    >
      {loading ? (
        <div className="py-10 text-center text-xs text-[#0A1F14]/60 flex flex-col items-center justify-center gap-2">
          <div className="w-6 h-6 rounded-full border-2 border-[#1B5E3F]/20 border-t-[#1B5E3F] animate-spin" />
          <span>Loading registered users...</span>
        </div>
      ) : error ? (
        <div className="py-8 text-center text-xs text-[#0A1F14]/60 flex flex-col items-center justify-center">
          <p className="font-bold text-[#0A1F14]">Unable to load registered users.</p>
          <button
            onClick={fetchRegistrations}
            className="mt-2.5 px-3.5 py-1 bg-[#1B5E3F] hover:bg-[#0F4A2E] text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
          >
            Try again
          </button>
        </div>
      ) : registrations.length === 0 ? (
        <div className="py-8 text-center text-xs text-[#0A1F14]/55">
          <p className="font-bold text-sm text-[#0A1F14]">No registered users</p>
          <p className="text-xs text-[#0A1F14]/55 mt-1">
            No one has registered for this event yet.
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
          {registrations.map((reg) => {
            const u = reg.userId || {};
            const registeredDateStr = reg.registeredAt || reg.createdAt
              ? new Date(reg.registeredAt || reg.createdAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "";

            return (
              <div
                key={reg._id}
                className="p-3 bg-[#FAFAF7] border border-[#1B5E3F]/8 rounded-xl flex items-center justify-between gap-3 hover:bg-[#F3F2EF] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={
                      u.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || "User")}&background=1B5E3F&color=fff`
                    }
                    alt={u.name || "User"}
                    className="w-9 h-9 rounded-full object-cover shrink-0 border border-[#1B5E3F]/15"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-xs text-[#0A1F14] truncate">{u.name || "Anonymous User"}</span>
                      {u.isVerified && <MdVerified className="w-3.5 h-3.5 text-[#1B5E3F] shrink-0" />}
                      <span className="px-1.5 py-0.2 bg-[#1B5E3F]/10 text-[#1B5E3F] text-[10px] font-bold rounded capitalize shrink-0">
                        {u.role || "User"}
                      </span>
                    </div>
                    {u.companyName && (
                      <p className="text-[11px] text-[#0A1F14]/70 font-medium truncate mt-0.5">
                        {u.companyName}
                      </p>
                    )}
                    {registeredDateStr && (
                      <p className="text-[10px] text-[#0A1F14]/50 mt-0.5 font-medium">
                        Registered: {registeredDateStr}
                      </p>
                    )}
                  </div>
                </div>

                {u._id && (
                  <Link
                    to={`/app/u/${u._id}`}
                    onClick={onClose}
                    className="px-2.5 py-1 bg-[#1B5E3F] hover:bg-[#0F4A2E] text-white text-[11px] font-bold rounded-lg transition-colors shrink-0 cursor-pointer shadow-2xs"
                  >
                    View Profile →
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}

export default function AdminEventsPage() {
  const toast = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Registrations Modal State
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registrationsModalOpen, setRegistrationsModalOpen] = useState(false);

  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [location, setLocation] = useState("Online");
  const [eventType, setEventType] = useState("offline");
  const [capacity, setCapacity] = useState(0);
  const [status, setStatus] = useState("published");

  const fetchAdminEvents = () => {
    setLoading(true);
    eventService
      .adminList({ limit: 50 })
      .then((res) => {
        const data = res?.data?.data || res?.data;
        const list = data?.events || (Array.isArray(data) ? data : []);
        setEvents(Array.isArray(list) ? list : []);
      })
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAdminEvents();
  }, []);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!title.trim() || !startDate) {
      toast.error("Event title and start date are required");
      return;
    }

    setSaving(true);
    try {
      await eventService.adminCreate({
        title: title.trim(),
        description: description.trim(),
        startDate,
        location: location.trim(),
        eventType,
        capacity: Number(capacity) || 0,
        status,
      });

      toast.success("Event created successfully!");
      setOpenModal(false);
      setTitle("");
      setDescription("");
      setStartDate("");
      setLocation("Online");
      setCapacity(0);
      setStatus("published");
      fetchAdminEvents();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create event");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, e) => {
    e?.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await eventService.adminDelete(id);
      toast.success("Event deleted");
      fetchAdminEvents();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete event");
    }
  };

  return (
    <DashboardShell
      mode="admin"
      title="Event Management"
      subtitle="Create and manage global upcoming events for Founders & Investors."
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-[#0A1F14] flex items-center gap-2">
          <HiCalendar className="w-5 h-5 text-[#1B5E3F]" />
          Platform Events ({events.length})
        </h2>
        <button
          onClick={() => setOpenModal(true)}
          className="px-4 py-2 bg-[#1B5E3F] hover:bg-[#0F4A2E] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
        >
          <HiPlus className="w-4 h-4" /> Create Event
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-[#0A1F14]/60 flex flex-col items-center justify-center gap-2">
          <div className="w-7 h-7 rounded-full border-2 border-[#1B5E3F]/20 border-t-[#1B5E3F] animate-spin" />
          <span>Loading platform events...</span>
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white border border-[#1B5E3F]/12 rounded-2xl p-10 text-center">
          <p className="font-bold text-sm text-[#0A1F14]">No events created yet.</p>
          <p className="text-xs text-[#0A1F14]/55 mt-1 max-w-sm mx-auto">
            Create an event above to automatically display it on user dashboards.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((ev) => (
            <div
              key={ev._id}
              className="bg-white border border-[#1B5E3F]/12 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      ev.status === "published"
                        ? "bg-[#1B5E3F]/10 text-[#1B5E3F]"
                        : ev.status === "cancelled"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {ev.status}
                  </span>
                  <span className="text-xs text-[#0A1F14]/50 font-medium">
                    {new Date(ev.startDate).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-[#0A1F14] line-clamp-1">{ev.title}</h3>
                {ev.description && (
                  <p className="text-xs text-[#0A1F14]/65 mt-1 line-clamp-2">{ev.description}</p>
                )}

                <div className="mt-4 pt-3 border-t border-[#1B5E3F]/8 space-y-2 text-xs text-[#0A1F14]/70">
                  <p className="flex items-center gap-1.5 font-medium">
                    <HiLocationMarker className="w-3.5 h-3.5 text-[#1B5E3F]" />
                    {ev.location || "Online"} ({ev.eventType})
                  </p>

                  <div
                    onClick={() => {
                      setSelectedEvent(ev);
                      setRegistrationsModalOpen(true);
                    }}
                    className="flex items-center justify-between p-2.5 bg-[#FAFAF7] hover:bg-[#1B5E3F]/8 border border-[#1B5E3F]/12 rounded-xl transition-colors cursor-pointer group"
                    title="Click to view registered users"
                  >
                    <span className="flex items-center gap-1.5 font-bold text-[#0A1F14]">
                      <HiUsers className="w-4 h-4 text-[#1B5E3F]" />
                      {ev.registeredCount || 0} Registered {ev.capacity > 0 ? `/ ${ev.capacity} Max` : ""}
                    </span>
                    <span className="text-[11px] font-bold text-[#1B5E3F] group-hover:underline flex items-center gap-0.5">
                      View registrants →
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#1B5E3F]/8 flex items-center justify-end gap-2">
                <button
                  onClick={(e) => handleDelete(ev._id, e)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  title="Delete event"
                >
                  <HiTrash className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Registrations Modal */}
      <RegisteredUsersModal
        open={registrationsModalOpen}
        onClose={() => setRegistrationsModalOpen(false)}
        event={selectedEvent}
      />

      {/* Create Event Modal */}
      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        title="Create New Event"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateEvent} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#0A1F14] mb-1">Event Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Bangalore Founder Meetup 2026"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-[#1B5E3F]/20 rounded-xl text-xs text-[#0A1F14] focus:outline-none focus:border-[#1B5E3F]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0A1F14] mb-1">Start Date & Time *</label>
            <input
              type="datetime-local"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-[#1B5E3F]/20 rounded-xl text-xs text-[#0A1F14] focus:outline-none focus:border-[#1B5E3F]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#0A1F14] mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Bangalore"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-[#1B5E3F]/20 rounded-xl text-xs text-[#0A1F14] focus:outline-none focus:border-[#1B5E3F]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#0A1F14] mb-1">Type</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-[#1B5E3F]/20 rounded-xl text-xs text-[#0A1F14] focus:outline-none focus:border-[#1B5E3F]"
              >
                <option value="offline">Offline</option>
                <option value="online">Online</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0A1F14] mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Event description and agenda..."
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-[#1B5E3F]/20 rounded-xl text-xs text-[#0A1F14] focus:outline-none focus:border-[#1B5E3F]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setOpenModal(false)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-[#0A1F14] text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-[#1B5E3F] hover:bg-[#0F4A2E] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            >
              {saving ? "Creating..." : "Publish Event"}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardShell>
  );
}
