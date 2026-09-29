export type AppPage =
  | "DASHBOARD"
  | "INCIDENTS"
  | "UNITS"
  | "PERSONNEL"
  | "SCENARIOS"
  | "SETTINGS";

interface AppSidebarProps {
  activePage: AppPage;
  onNavigate: (page: AppPage) => void;
}

const navigation: Array<{
  page: AppPage;
  label: string;
  icon: string;
}> = [
  { page: "DASHBOARD", label: "Dashboard", icon: "⌂" },
  { page: "INCIDENTS", label: "Incidents", icon: "!" },
  { page: "UNITS", label: "Units", icon: "▣" },
  { page: "PERSONNEL", label: "Personnel", icon: "♙" },
  { page: "SCENARIOS", label: "Scenarios", icon: "◇" },
  { page: "SETTINGS", label: "Settings", icon: "⚙" },
];

export function AppSidebar({
  activePage,
  onNavigate,
}: AppSidebarProps) {
  return (
    <aside className="app-sidebar">
      <div className="sidebar-brand">
        <span className="brand-mark">C</span>
        <div>
          <strong>cutieCAD</strong>
          <small>Training console</small>
        </div>
      </div>

      <nav aria-label="Primary navigation" className="sidebar-navigation">
        {navigation.map((item) => (
          <button
            className={`sidebar-link ${
              activePage === item.page ? "active" : ""
            }`}
            key={item.page}
            onClick={() => onNavigate(item.page)}
            type="button"
          >
            <span aria-hidden="true" className="sidebar-icon">
              {item.icon}
            </span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <span className="simulation-label">Simulation only</span>
        <p>Not connected to 911 or real responders.</p>
      </div>
    </aside>
  );
}