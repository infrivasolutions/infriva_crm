export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  tone = "primary",
}) {
  const tones = {
    primary: "bg-primary-light text-primary",
    green: "bg-green-50 text-green-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
    blue: "bg-blue-50 text-blue-700",
  };

  return (
    <div className="theme-card-soft p-5 transition hover:-translate-y-1 hover:shadow-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-muted">{title}</p>
          <h3 className="mt-3 text-3xl font-black text-foreground">{value}</h3>
          <p className="mt-2 text-sm text-muted">{subtitle}</p>
        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
            tones[tone] || tones.primary
          }`}
        >
          <Icon size={22} />
        </div>
      </div>

      {trend && (
        <div className="mt-5 inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold text-primary">
          {trend}
        </div>
      )}
    </div>
  );
}
