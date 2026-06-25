import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { fmtEur } from "@/lib/format";

export const LabChart = ({ labs }) => {
  const data = labs
    .slice()
    .sort((a, b) => b.rent_txt_total - a.rent_txt_total)
    .slice(0, 12)
    .map((l) => ({
      name: l.laboratorio,
      Real: l.rent_txt_total,
      Cardex: l.rent_xls_total,
    }));

  return (
    <ResponsiveContainer width="100%" height={340}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(145 8% 88%)" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(147 7% 37%)" }} angle={-25} textAnchor="end" height={70} interval={0} />
        <YAxis tick={{ fontSize: 11, fill: "hsl(147 7% 37%)" }} width={70} tickFormatter={(v) => `${v}€`} />
        <Tooltip
          formatter={(v) => fmtEur(v)}
          contentStyle={{ borderRadius: 8, border: "1px solid hsl(145 8% 83%)", fontSize: 13 }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="Real" fill="hsl(164 56% 20%)" radius={[3, 3, 0, 0]} />
        <Bar dataKey="Cardex" fill="hsl(153 45% 60%)" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};
