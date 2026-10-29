import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatWeightDate } from "@/lib/student-evolution";

export function WeightChart({ records }: { records: { dataRegistro: string; peso: number }[] }) {
  return (
    <div
      className="h-64 min-w-0 w-full"
      role="img"
      aria-label="Gráfico de evolução do peso por data"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={records} margin={{ left: 0, right: 12, top: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="student-weight-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
          <XAxis
            dataKey="dataRegistro"
            tickFormatter={formatWeightDate}
            stroke="var(--color-muted-foreground)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="var(--color-muted-foreground)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            domain={["dataMin - 1", "dataMax + 1"]}
            unit=" kg"
          />
          <Tooltip
            labelFormatter={(label) => formatWeightDate(String(label))}
            formatter={(value) => [
              `${Number(value).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kg`,
              "Peso",
            ]}
            contentStyle={{
              background: "var(--color-card)",
              border: "1px solid var(--color-border)",
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Area
            type="monotone"
            dataKey="peso"
            stroke="var(--color-primary)"
            strokeWidth={2}
            fill="url(#student-weight-fill)"
            dot={{ r: records.length === 1 ? 5 : 3 }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
