import DashboardShell from "./DashboardShell";

                                                                                                                                                                                                                                                       
export default function FeedShell({ children, mode }) {
  return (
    <DashboardShell mode={mode} noPad fullWidth noScroll rightSidebar={null}>
      <div className="w-full h-full min-w-0 min-h-0 relative overflow-hidden bg-black p-0 m-0 gap-0 space-y-0 flex-1 rounded-none border-0 shadow-none">
        {children}
      </div>
    </DashboardShell>
  );
}
