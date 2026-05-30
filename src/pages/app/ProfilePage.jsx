import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  HiPencilAlt,
  HiGlobe,
  HiOfficeBuilding,
  HiBriefcase,
  HiShieldCheck,
} from "react-icons/hi";
import { FaLinkedin } from "react-icons/fa";
import { MdVerified } from "react-icons/md";

import DashboardShell from "../../components/dashboard/DashboardShell";
import { CURRENT_USER, MOCK_PITCHES } from "../../constants/mockData";

export default function ProfilePage() {
  return (
    <DashboardShell title="My profile">
      {/* Cover + avatar */}
      <div className="relative bg-card-bg/60 border-2 border-gold/15 rounded-2xl overflow-hidden mb-6">
        <div className="h-40 bg-gradient-to-br from-gold/30 via-primary-green/30 to-dark-navy" />
        <div className="px-5 pb-5 -mt-12">
          <img
            src={CURRENT_USER.avatar}
            alt={CURRENT_USER.name}
            className="w-24 h-24 rounded-full border-4 border-card-bg object-cover"
          />
          <div className="flex items-end justify-between flex-wrap gap-3 mt-3">
            <div>
              <h2 className="text-2xl font-black flex items-center gap-2">
                {CURRENT_USER.name}
                {CURRENT_USER.isVerified && (
                  <MdVerified className="w-6 h-6 text-gold" />
                )}
              </h2>
              <p className="text-sm text-gray-400">@{CURRENT_USER.username}</p>
              <p className="text-sm text-gray-300 mt-2 max-w-2xl">
                {CURRENT_USER.bio}
              </p>
            </div>
            <Link to="/app/settings">
              <motion.button
                className="px-5 py-2.5 bg-gold text-dark-navy text-sm font-bold rounded-xl flex items-center gap-2"
                whileHover={{ scale: 1.03 }}
              >
                <HiPencilAlt className="w-4 h-4" />
                Edit profile
              </motion.button>
            </Link>
          </div>

          {/* Quick info chips */}
          <div className="flex flex-wrap gap-2 mt-4">
            {CURRENT_USER.companyName && (
              <Chip icon={HiOfficeBuilding}>{CURRENT_USER.companyName}</Chip>
            )}
            {CURRENT_USER.industry && (
              <Chip icon={HiBriefcase}>{CURRENT_USER.industry}</Chip>
            )}
            {CURRENT_USER.fundingStage && (
              <Chip icon={HiShieldCheck}>{CURRENT_USER.fundingStage}</Chip>
            )}
            {CURRENT_USER.website && (
              <Chip icon={HiGlobe}>{CURRENT_USER.website}</Chip>
            )}
            {CURRENT_USER.linkedIn && <Chip icon={FaLinkedin}>LinkedIn</Chip>}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Stats */}
        <div className="lg:col-span-2 grid grid-cols-3 gap-4">
          <MiniStat label="Total views" value="4.2k" />
          <MiniStat label="Connections" value="38" />
          <MiniStat label="Saves" value="89" />
        </div>

        {/* Profile completeness */}
        <div className="bg-card-bg/60 border-2 border-gold/15 rounded-2xl p-5">
          <p className="text-xs uppercase tracking-wider font-bold text-gray-400 mb-1">
            Profile completeness
          </p>
          <p className="text-3xl font-black mb-2">
            {CURRENT_USER.profileCompleteness}%
          </p>
          <div className="h-2 bg-dark-bg rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-gold to-bright-gold"
              initial={{ width: 0 }}
              animate={{ width: `${CURRENT_USER.profileCompleteness}%` }}
              transition={{ duration: 1 }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Add a pitch deck to reach 100%
          </p>
        </div>
      </div>

      {/* Pitches */}
      <h3 className="text-lg font-bold mb-3">My pitches</h3>
      <div className="grid sm:grid-cols-2 gap-4">
        {MOCK_PITCHES.slice(0, 2).map((p) => (
          <div
            key={p._id}
            className="bg-card-bg/60 border-2 border-gold/15 rounded-2xl overflow-hidden flex"
          >
            <img
              src={p.thumbnailUrl}
              alt={p.title}
              className="w-32 h-32 object-cover flex-shrink-0"
            />
            <div className="p-3 min-w-0">
              <p className="font-bold text-sm line-clamp-1">{p.title}</p>
              <p className="text-xs text-gray-400 line-clamp-2 mt-1">
                {p.description}
              </p>
              <p className="text-xs text-gold font-bold mt-2">
                {p.views.toLocaleString()} views · {p.likes.length} likes
              </p>
            </div>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="bg-card-bg/60 border-2 border-gold/15 rounded-2xl p-5 text-center">
      <p className="text-3xl font-black">{value}</p>
      <p className="text-xs text-gray-400 mt-1 font-semibold">{label}</p>
    </div>
  );
}

function Chip({ icon: Icon, children }) {
  return (
    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-dark-bg/60 border border-gold/15 rounded-full text-xs font-semibold text-gray-300">
      <Icon className="w-4 h-4 text-gold" />
      {children}
    </span>
  );
}
