

interface StatCardItem {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "stable";
  type: "alert" | "zone" | "accuracy" | "rainfall";
}

interface StatCardsProps {
  stats: StatCardItem[];
}

const iconMap = {
  alert: "🚨",
  zone: "⚠",
  accuracy: "📊",
  rainfall: "🌧",
};

export default function StatCards({ stats }: StatCardsProps) {
  return (
    <div className="db-stat-grid">
      {stats.map((stat, i) => (
        <div key={i} className={`db-stat-card stat-${stat.type}`}>
          <div className="stat-icon">{iconMap[stat.type]}</div>
          <div className="stat-label">{stat.label}</div>
          <div className={`stat-value stat-${stat.type}`}>{stat.value}</div>
          <div className={`stat-change change-${stat.trend}`}>
            {stat.trend === "up" && "↑ "}
            {stat.trend === "down" && "↓ "}
            {stat.change}
          </div>
        </div>
      ))}
    </div>
  );
}
