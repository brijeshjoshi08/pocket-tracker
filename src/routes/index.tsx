import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MySpend — Personal Expense Tracker" },
      { name: "description", content: "Track your spending and remaining balance on your device. No signup required." },
      { property: "og:title", content: "MySpend — Personal Expense Tracker" },
      { property: "og:description", content: "Track your spending and remaining balance on your device." },
    ],
  }),
  component: Index,
});

type Expense = { id: string; amount: number; reason: string; date: string };

const LS = {
  name: "ms_name",
  pic: "ms_pic",
  total: "ms_total",
  expenses: "ms_expenses",
};

function useLocal<T>(key: string, initial: T) {
  const [val, setVal] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const raw = localStorage.getItem(key);
    if (raw !== null) {
      try { setVal(JSON.parse(raw)); } catch { /* ignore */ }
    }
    setHydrated(true);
  }, [key]);
  useEffect(() => {
    if (hydrated) localStorage.setItem(key, JSON.stringify(val));
  }, [key, val, hydrated]);
  return [val, setVal, hydrated] as const;
}

function Index() {
  const [name, setName] = useLocal<string>(LS.name, "Your Name");
  const [pic, setPic] = useLocal<string>(LS.pic, "");
  const [total, setTotal] = useLocal<number>(LS.total, 0);
  const [expenses, setExpenses] = useLocal<Expense[]>(LS.expenses, []);

  const [editingProfile, setEditingProfile] = useState(false);
  const [totalInput, setTotalInput] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  const spent = expenses.reduce((s, e) => s + e.amount, 0);
  const rest = total - spent;

  const addExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0 || !reason.trim()) return;
    setExpenses([
      { id: crypto.randomUUID(), amount: amt, reason: reason.trim(), date: new Date().toISOString() },
      ...expenses,
    ]);
    setAmount("");
    setReason("");
  };

  const removeExpense = (id: string) => setExpenses(expenses.filter((e) => e.id !== id));

  const onPicChange = (file: File | undefined) => {
    if (!file) return;
    const r = new FileReader();
    r.onload = () => setPic(String(r.result));
    r.readAsDataURL(file);
  };

  const setTotalAmount = (e: React.FormEvent) => {
    e.preventDefault();
    const v = parseFloat(totalInput);
    if (!isNaN(v)) setTotal(v);
    setTotalInput("");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
        {/* Profile */}
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onPicChange(e.target.files?.[0])}
              />
              {pic ? (
                <img src={pic} alt="Profile" className="h-20 w-20 rounded-full object-cover ring-2 ring-primary/20" />
              ) : (
                <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center text-2xl font-semibold text-muted-foreground">
                  {name.charAt(0).toUpperCase() || "?"}
                </div>
              )}
            </label>
            <div className="flex-1">
              {editingProfile ? (
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => setEditingProfile(false)}
                  onKeyDown={(e) => e.key === "Enter" && setEditingProfile(false)}
                  className="w-full rounded-md border bg-background px-2 py-1 text-lg font-semibold"
                />
              ) : (
                <button
                  onClick={() => setEditingProfile(true)}
                  className="text-lg font-semibold hover:underline"
                >
                  {name}
                </button>
              )}
              <p className="text-xs text-muted-foreground mt-1">Tap avatar to change photo</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <Stat label="Total" value={total} />
            <Stat label="Spent" value={spent} tone="muted" />
            <Stat label="Remaining" value={rest} tone={rest < 0 ? "danger" : "good"} />
          </div>

          <form onSubmit={setTotalAmount} className="mt-4 flex gap-2">
            <input
              type="number"
              step="0.01"
              placeholder="Set total amount"
              value={totalInput}
              onChange={(e) => setTotalInput(e.target.value)}
              className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
            />
            <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              Set
            </button>
          </form>
        </div>

        {/* Add expense */}
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="text-base font-semibold mb-3">Add expense</h2>
          <form onSubmit={addExpense} className="space-y-3">
            <input
              type="number"
              step="0.01"
              placeholder="Amount spent"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
            <input
              type="text"
              placeholder="What was it for?"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Add expense
            </button>
          </form>
        </div>

        {/* List */}
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="text-base font-semibold mb-3">History</h2>
          {expenses.length === 0 ? (
            <p className="text-sm text-muted-foreground">No expenses yet.</p>
          ) : (
            <ul className="divide-y">
              {expenses.map((e) => (
                <li key={e.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">{e.reason}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(e.date).toLocaleDateString()} · {new Date(e.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">-{e.amount.toFixed(2)}</span>
                    <button
                      onClick={() => removeExpense(e.id)}
                      className="text-xs text-muted-foreground hover:text-destructive"
                      aria-label="Delete"
                    >
                      ✕
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "good" | "danger" | "muted" }) {
  const color =
    tone === "danger" ? "text-destructive" : tone === "good" ? "text-emerald-600" : tone === "muted" ? "text-muted-foreground" : "text-foreground";
  return (
    <div className="rounded-lg bg-muted/40 p-3 text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-1 text-lg font-semibold ${color}`}>{value.toFixed(2)}</p>
    </div>
  );
}
