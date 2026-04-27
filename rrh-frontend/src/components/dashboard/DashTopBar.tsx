

interface TopBarProps {
  title: string;
  subtitle?: string;
  actions?: { label: string; onClick: () => void }[];
}

export default function DashTopBar({ title, subtitle, actions }: TopBarProps) {
  return (
    <div className="db-topbar">
      <div className="topbar-content">
        <div>
          <h1 className="topbar-title">{title}</h1>
          {subtitle && <p className="topbar-sub">{subtitle}</p>}
        </div>
        {actions && (
          <div className="topbar-actions">
            {actions.map((action, i) => (
              <button key={i} className="btn-topbar" onClick={action.onClick}>
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
