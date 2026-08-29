import { useEffect, useState, useCallback } from "react";
import { HiCalendar, HiLocationMarker, HiUsers, HiCheckCircle } from "react-icons/hi";
import DashboardShell from "../../components/dashboard/DashboardShell";
import { useToast } from "../../components/ui/Toast";
import { eventService } from "../../services/eventService";

function formatEventDate(dateInput) {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AppEventsPage() {
  const toast = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [registeringId, setRegisteringId] = useState(null);

  const fetchEvents = useCallback(() => {
    setLoading(true);
    setError(false);

    eventService
      .getUpcoming({ limit: 50 })
      .then((res) => {
        const data = res?.data?.data || res?.data;
        const list = data?.events || (Array.isArray(data) ? data : []);
        setEvents(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        setError(true);
        setEvents([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleRegister = async (eventId, e) => {
    e?.preventDefault();
    setRegisteringId(eventId);

    try {
      const res = await eventService.register(eventId);
      const data = res?.data?.data || res?.data;

      setEvents((prev) =>
        prev.map((ev) =>
          ev._id === eventId
            ? { ...ev, isRegistered: true, registeredCount: (ev.registeredCount || 0) + (ev.isRegistered ? 0 : 1) }
            : ev
        )
      );

      if (data?.alreadyRegistered) {
        toast?.info?.("You are already registered for this event.");
      } else {
        toast?.success?.("Successfully registered for event!");
      }
    } catch (err) {
      const errMsg = err?.response?.data?.message || err?.message || "Registration failed";
      toast?.error?.(errMsg);
    } finally {
      setRegisteringId(null);
    }
  };

  return (
    <DashboardShell
      title="Upcoming Events"
      subtitle="Explore and register for upcoming startup events, pitch sessions, and investor meetups."
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#1B5E3F]/10">
          <h2 className="text-lg font-bold text-[#0A1F14] flex items-center gap-2">
            <HiCalendar className="w-5 h-5 text-[#1B5E3F]" />
            Upcoming Platform Events ({events.length})
          </h2>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs text-[#0A1F14]/60 flex flex-col items-center justify-center gap-2">
            <div className="w-7 h-7 rounded-full border-2 border-[#1B5E3F]/20 border-t-[#1B5E3F] animate-spin" />
            <span className="font-medium text-[#0A1F14]/70">Loading upcoming events...</span>
          </div>
        ) : error ? (
          <div className="bg-white border border-[#1B5E3F]/12 rounded-2xl p-10 text-center">
            <p className="font-bold text-sm text-[#0A1F14]">Unable to load upcoming events.</p>
            <p className="text-xs text-[#0A1F14]/60 mt-1">
              Check your network connection and try again.
            </p>
            <button
              onClick={fetchEvents}
              className="mt-4 px-4 py-2 bg-[#1B5E3F] hover:bg-[#0F4A2E] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-2xs"
            >
              Try again
            </button>
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white border border-[#1B5E3F]/12 rounded-2xl p-12 text-center">
            <p className="font-bold text-base text-[#0A1F14]">No upcoming events</p>
            <p className="text-xs text-[#0A1F14]/55 mt-1.5 max-w-sm mx-auto">
              Check back soon for new events, pitch sessions, and founder meetups.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((ev) => {
              const dateLabel = formatEventDate(ev.startDate);

              return (
                <div
                  key={ev._id}
                  className="bg-white border border-[#1B5E3F]/12 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#1B5E3F]/10 text-[#1B5E3F]">
                        {ev.eventType || "Event"}
                      </span>
                      <span className="text-xs text-[#0A1F14]/60 font-medium">
                        {dateLabel}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-[#0A1F14]">{ev.title}</h3>
                    {ev.description && (
                      <p className="text-xs text-[#0A1F14]/70 mt-1.5 line-clamp-3 leading-relaxed">
                        {ev.description}
                      </p>
                    )}

                    <div className="mt-4 pt-3 border-t border-[#1B5E3F]/8 space-y-1.5 text-xs text-[#0A1F14]/75">
                      <p className="flex items-center gap-1.5 font-medium">
                        <HiLocationMarker className="w-4 h-4 text-[#1B5E3F] shrink-0" />
                        {ev.location || "Online"}
                      </p>
                      <p className="flex items-center gap-1.5 font-medium">
                        <HiUsers className="w-4 h-4 text-[#1B5E3F] shrink-0" />
                        {ev.registeredCount || 0} Registered {ev.capacity > 0 ? `/ ${ev.capacity} Max` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-[#1B5E3F]/8 flex items-center justify-end">
                    {ev.isRegistered ? (
                      <span className="px-4 py-2 bg-[#1B5E3F]/10 text-[#1B5E3F] text-xs font-bold rounded-xl flex items-center gap-1.5 border border-[#1B5E3F]/20">
                        <HiCheckCircle className="w-4 h-4" /> Registered
                      </span>
                    ) : ev.isFull ? (
                      <span className="px-4 py-2 bg-gray-100 text-gray-500 text-xs font-bold rounded-xl border border-gray-200">
                        Registration Full
                      </span>
                    ) : (
                      <button
                        onClick={(e) => handleRegister(ev._id, e)}
                        disabled={registeringId === ev._id}
                        className="px-4 py-2 bg-[#1B5E3F] hover:bg-[#0F4A2E] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
                      >
                        {registeringId === ev._id ? "Registering..." : "Register →"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
