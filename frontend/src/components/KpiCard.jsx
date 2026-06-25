import { Card } from "@/components/ui/card";

export const KpiCard = ({ title, value, subtitle, icon: Icon, tone = "default", testid }) => {
  const toneClass =
    tone === "gain" ? "text-[#1A7B5E]" : tone === "loss" ? "text-[#B23A3A]" : "text-foreground";
  return (
    <Card data-testid={testid} className="p-6 border border-border hover:shadow-sm transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
        {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
      </div>
      <p className={`mt-3 text-3xl font-heading font-semibold tracking-tight tabular-nums ${toneClass}`}>
        {value}
      </p>
      {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
    </Card>
  );
};
