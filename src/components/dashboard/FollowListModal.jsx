import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MdVerified } from "react-icons/md";
import Modal from "../ui/Modal";
import FollowButton from "../monetization/FollowButton";
import { userService } from "../../services/userService";

/**
 * Modal listing a user's followers or following.
 * mode: "followers" | "following"
 * preloadedFollowers / preloadedFollowing: arrays already fetched from the profile API
 */
export default function FollowListModal({
  open,
  onClose,
  userId,
  mode,
  preloadedFollowers = null,
  preloadedFollowing = null,
}) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !userId || !mode) return;

    // Use preloaded data if available (avoids a second API call)
    const preloaded = mode === "followers" ? preloadedFollowers : preloadedFollowing;
    if (preloaded !== null) {
      // Filter out any non-object entries (raw ObjectIds stored as strings)
      const validUsers = preloaded.filter(
        (item) => item && typeof item === "object" && item._id && item.name,
      );
      setUsers(validUsers);
      return;
    }

    // Fallback: fetch from API
    setLoading(true);
    const fetcher =
      mode === "followers"
        ? userService.getFollowers(userId)
        : userService.getFollowing(userId);
    fetcher
      .then((res) => {
        const data = res?.data?.data || res?.data;
        // Backend returns { users, followers, following, list } — handle all shapes
        const list =
          (mode === "followers"
            ? data?.followers || data?.users || data?.list
            : data?.following || data?.users || data?.list) ||
          data ||
          [];
        const arr = Array.isArray(list) ? list : [];
        setUsers(
          arr.filter(
            (item) => item && typeof item === "object" && item._id && item.name,
          ),
        );
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, [open, userId, mode, preloadedFollowers, preloadedFollowing]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        mode === "followers"
          ? `Followers (${users.length.toLocaleString()})`
          : `Following (${users.length.toLocaleString()})`
      }
      maxWidth="max-w-md"
    >
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-7 h-7 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
        </div>
      ) : users.length === 0 ? (
        <p className="text-center text-gray-400 py-10 text-sm">
          {mode === "followers"
            ? "No followers yet."
            : "Not following anyone yet."}
        </p>
      ) : (
        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {users.map((u) => (
            <div key={u._id} className="flex items-center gap-3">
              <Link
                to={`/app/u/${u._id}`}
                onClick={onClose}
                className="flex items-center gap-3 flex-1 min-w-0"
              >
                <img
                  src={
                    u.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || "U")}&background=1B5E3F&color=fff`
                  }
                  alt={u.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="min-w-0">
                  <p className="font-bold text-sm truncate flex items-center gap-1">
                    {u.name}
                    {u.isVerified && (
                      <MdVerified className="w-3.5 h-3.5 text-gold" />
                    )}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {u.companyName || `@${u.username || "user"}`}
                  </p>
                </div>
              </Link>
              <FollowButton userId={u._id} variant="outline" />
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
