import DashboardShell from "../../components/dashboard/DashboardShell";
import PitchCard from "../../components/dashboard/PitchCard";
import { MOCK_PITCHES } from "../../constants/mockData";

export default function SavedPitchesPage() {
  // Pretend the investor saved 3 of these
  const saved = MOCK_PITCHES.slice(0, 3);

  return (
    <DashboardShell
      title="Saved pitches"
      subtitle={`${saved.length} pitches you bookmarked.`}
    >
      {saved.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          You haven't saved any pitches yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {saved.map((p) => (
            <PitchCard key={p._id} pitch={p} />
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
