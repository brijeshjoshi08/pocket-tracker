import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "MySpend — Personal Expense Tracker" },
      { name: "description", content: "Track your spending and remaining balance. Signed-in cloud storage." },
      { property: "og:title", content: "MySpend — Personal Expense Tracker" },
      { property: "og:description", content: "Track your spending and remaining balance." },
    ],
  }),
  component: Dashboard,
});

type Profile = { id: string; display_name: string | null; photo_url: string | null; total_amount: number };
type Expense = { id: string; amount: number; reason: string; created_at: string };

function Dashboard() {
  const qc = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  const profileQ = useQuery({
    enabled: !!userId,
    queryKey: ["profile", userId],
    queryFn: async (): Promise<Profile> => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId!).maybeSingle();
      if (error) throw error;
      if (!data) {
        const { data: created, error: e2 } = await supabase
          .from("profiles")
          .insert({ id: userId! })
          .select()
          .single();
        if (e2) throw e2;
        return created as Profile;
      }
      return data as Profile;
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
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Expense[];
    },
  });

  const [editingProfile, setEditingProfile] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [totalInput, setTotalInput] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  const profile = profileQ.data;
  const expenses = expensesQ.data ?? [];
  const total = Number(profile?.total_amount ?? 0);
  const spent = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const rest = total - spent;

  const updateProfile = async (patch: Partial<Profile>) => {
    if (!userId) return;
    const { error } = await supabase.from("profiles").update(patch).eq("id", userId);
    if (error) return alert(error.message);
    qc.invalidateQueries({ queryKey: ["profile", userId] });
  };

  const saveName = async () => {
    await updateProfile({ display_name: nameDraft });
    setEditingProfile(false);
  };

  const onPicChange = (file: File | undefined) => {
    if (!file) return;
    const r = new FileReader();
    r.onload = () => updateProfile({ photo_url: String(r.result) });
    r.readAsDataURL(file);
  };

  const setTotalAmount = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = parseFloat(totalInput);
    if (isNaN(v)) return;
    await updateProfile({ total_amount: v });
    setTotalInput("");
  };

  const addExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0 || !reason.trim() || !userId) return;
    const { error } = await supabase
      .from("expenses")
      .insert({ user_id: userId, amount: amt, reason: reason.trim() });
    if (error) return alert(error.message);
    setAmount("");
    setReason("");
    qc.invalidateQueries({ queryKey: ["expenses", userId] });
  };

  const removeExpense = async (id: string) => {
    const { error } = await supabase.from("expenses").delete().eq("id", id);
    if (error) return alert(error.message);
    qc.invalidateQueries({ queryKey: ["expenses", userId] });
  };

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    window.location.href = "/auth";
  };

  const displayName = profile?.display_name || "Your Name";

  return (
    <div className="min-h-screen text-foreground">
      <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight text-gradient">MySpend</h1>
          <div className="flex items-center gap-3">
            <Link
              to="/desktop"
              className="rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Get desktop app
            </Link>
            <button
              onClick={signOut}
              className="text-xs text-muted-foreground hover:text-foreground underline"
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Profile */}
        <div className="relative overflow-hidden rounded-2xl border bg-card p-6 shadow-glow">
          <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-gradient-hero opacity-30 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-gradient-sunset opacity-20 blur-2xl" />
          <div className="relative flex items-center gap-4">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onPicChange(e.target.files?.[0])}
              />
              {profile?.photo_url ? (
                <img src={profile.photo_url} alt="Profile" className="h-20 w-20 rounded-full object-cover ring-4 ring-primary/40" />
              ) : (
                <div className="h-20 w-20 rounded-full bg-gradient-hero flex items-center justify-center text-2xl font-bold text-white shadow-glow">
                  {displayName.charAt(0).toUpperCase() || "?"}
                </div>
              )}
            </label>
            <div className="flex-1">
              {editingProfile ? (
                <input
                  autoFocus
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  onBlur={saveName}
                  onKeyDown={(e) => e.key === "Enter" && saveName()}
                  className="w-full rounded-md border bg-background px-2 py-1 text-lg font-semibold"
                />
              ) : (
                <button
                  onClick={() => {
                    setNameDraft(displayName);
                    setEditingProfile(true);
                  }}
                  className="text-lg font-semibold hover:underline"
                >
                  {displayName}
                </button>
              )}
              <p className="text-xs text-muted-foreground mt-1">Tap avatar to change photo</p>
            </div>
          </div>

          <div className="relative mt-6 grid grid-cols-3 gap-3">
            <Stat label="Total" value={total} tone="blue" />
            <Stat label="Spent" value={spent} tone="orange" />
            <Stat label="Remaining" value={rest} tone={rest < 0 ? "danger" : "green"} />
          </div>

          <form onSubmit={setTotalAmount} className="relative mt-4 flex gap-2">
            <input
              type="number"
              step="0.01"
              placeholder="Set total amount"
              value={totalInput}
              onChange={(e) => setTotalInput(e.target.value)}
              className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
            />
            <button className="rounded-md bg-gradient-hero px-4 py-2 text-sm font-semibold text-white shadow-glow hover:opacity-90">
              Set
            </button>
          </form>
        </div>

        {/* Add expense */}
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-gradient-sunset" />
            Add expense
          </h2>
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
              className="w-full rounded-md bg-gradient-sunset px-4 py-2 text-sm font-semibold text-white shadow-glow hover:opacity-90"
            >
              Add expense
            </button>
          </form>
        </div>

        {/* List */}
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-gradient-mint" />
            History
          </h2>
          {expenses.length === 0 ? (
            <p className="text-sm text-muted-foreground">No expenses yet.</p>
          ) : (
            <ul className="divide-y">
              {expenses.map((e, i) => {
                const dots = ["bg-brand-pink", "bg-brand-purple", "bg-brand-blue", "bg-brand-teal", "bg-brand-orange", "bg-brand-green"];
                return (
                  <li key={e.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <span
                        className="inline-block h-8 w-8 rounded-lg"
                        style={{
                          background: [
                            "var(--brand-pink)",
                            "var(--brand-purple)",
                            "var(--brand-blue)",
                            "var(--brand-teal)",
                            "var(--brand-orange)",
                            "var(--brand-green)",
                          ][i % 6],
                        }}
                        aria-hidden
                      />
                      <div>
                        <p className="text-sm font-medium">{e.reason}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(e.created_at).toLocaleDateString()} · {new Date(e.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-destructive">-{Number(e.amount).toFixed(2)}</span>
                      <button
                        onClick={() => removeExpense(e.id)}
                        className="text-xs text-muted-foreground hover:text-destructive"
                        aria-label="Delete"
                      >
                        ✕
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "blue" | "orange" | "green" | "danger" }) {
  const bg =
    tone === "danger"
      ? "linear-gradient(135deg, oklch(0.72 0.22 20), oklch(0.62 0.25 20))"
      : tone === "green"
      ? "var(--gradient-mint)"
      : tone === "orange"
      ? "var(--gradient-sunset)"
      : "var(--gradient-hero)";
  return (
    <div className="rounded-xl p-3 text-center text-white shadow-glow" style={{ backgroundImage: bg }}>
      <p className="text-[10px] uppercase tracking-wider opacity-90">{label}</p>
      <p className="mt-1 text-lg font-bold">{value.toFixed(2)}</p>
    </div>
  );
}
