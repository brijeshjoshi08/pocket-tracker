import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
} from "recharts";

export const Route = createFileRoute("/_authenticated/insights")({
  head: () => ({
    meta: [
      { title: "Insights — Pocket Tracker" },
      { name: "description", content: "Visualize your spending with colorful charts and graphs." },
      { property: "og:title", content: "Insights — Pocket Tracker" },
      { property: "og:description", content: "See where your money goes with interactive charts." },
    ],
  }),
  component: Insights,
});

type Expense = { id: string; amount: number; reason: string; created_at: string };
type Profile = { total_amount: number };

const COLORS = ["#f472b6", "#a855f7", "#3b82f6", "#14b8a6", "#f59e0b", "#22c55e", "#ef4444", "#eab308"];

function Insights() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  const profileQ = useQuery({
    enabled: !!userId,
    queryKey: ["profile", userId],
    queryFn: async (): Promise<Profile | null> => {
      const { data } = await supabase.from("profiles").select("total_amount").eq("id", userId!).maybeSingle();
      return (data as Profile) ?? null;
    },
  });

  const expensesQ = useQuery({
    enabled: !!userId,
    queryKey: ["expenses", userId],
    queryFn: async (): Promise<Expense[]> => {
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .eq("user_id", userId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Expense[];
    },
  });

  const expenses = expensesQ.data ?? [];
  const total = Number(profileQ.data?.total_amount ?? 0);
  const spent = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const rest = Math.max(total - spent, 0);

  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of expenses) {
      const key = e.reason.trim() || "Other";
      map.set(key, (map.get(key) ?? 0) + Number(e.amount));
    }
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [expenses]);

  const byDay = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of expenses) {
      const d = new Date(e.created_at);
      const key = d.toLocaleDateString([], { month: "short", day: "numeric" });
      map.set(key, (map.get(key) ?? 0) + Number(e.amount));
    }
    return Array.from(map.entries()).map(([day, amount]) => ({ day, amount }));
  }, [expenses]);

  const cumulative = useMemo(() => {
    let sum = 0;
    return expenses.map((e) => {
      sum += Number(e.amount);
      return {
        day: new Date(e.created_at).toLocaleDateString([], { month: "short", day: "numeric" }),
        spent: sum,
        remaining: Math.max(total - sum, 0),
      };
    });
  }, [expenses, total]);

  const budgetPie = [
    { name: "Spent", value: spent },
    { name: "Remaining", value: rest },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-gradient">Insights</h1>
        <p className="text-sm text-muted-foreground">Colorful view of your spending habits.</p>
      </div>

      {expenses.length === 0 ? (
        <div className="rounded-2xl border bg-card p-10 text-center shadow-sm">
          <p className="text-muted-foreground">No expenses yet — add some to see charts here.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <Card title="Budget breakdown">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={budgetPie} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                  <Cell fill="#f472b6" />
                  <Cell fill="#14b8a6" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Spending by category">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={byCategory} dataKey="value" nameKey="name" outerRadius={95} label>
                  {byCategory.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Daily spending" full>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={byDay}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="day" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                  {byDay.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Spent vs remaining over time" full>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={cumulative}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="day" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="spent" stroke="#a855f7" strokeWidth={3} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="remaining" stroke="#14b8a6" strokeWidth={3} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}
    </div>
  );
}

function Card({ title, children, full }: { title: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={`rounded-2xl border bg-card p-5 shadow-sm ${full ? "md:col-span-2" : ""}`}>
      <h2 className="mb-3 text-sm font-semibold">{title}</h2>
      {children}
    </div>
  );
}
