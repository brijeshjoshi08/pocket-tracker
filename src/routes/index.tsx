import { createFileRoute, Link } from "@tanstack/react-router";
import { Wallet, PieChart, ShieldCheck, Sparkles, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pocket Tracker — Smart Personal Expense Manager" },
      {
        name: "description",
        content:
          "Pocket Tracker helps you manage your money — set a budget, log expenses, and visualize insights with colorful charts.",
      },
      { property: "og:title", content: "Pocket Tracker — Smart Personal Expense Manager" },
      {
        property: "og:description",
        content: "Set a budget, track spends, and see beautiful insights of where your money goes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden text-foreground">
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-gradient-hero opacity-40 blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-gradient-sunset opacity-40 blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute top-1/3 right-1/4 h-72 w-72 rounded-full bg-gradient-mint opacity-30 blur-3xl" />

      <main className="relative mx-auto max-w-5xl px-4 py-16 sm:py-24">
        <div className="flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-hero shadow-glow flex items-center justify-center">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-extrabold text-gradient">Pocket Tracker</span>
          </div>
          <Link
            to="/auth"
            className="text-sm font-medium text-muted-foreground hover:text-foreground story-link"
          >
            Sign in
          </Link>
        </div>

        <section className="mt-16 text-center animate-fade-in">
          <span className="inline-flex items-center gap-1 rounded-full border bg-card/70 backdrop-blur px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
            <Sparkles className="h-3 w-3 text-primary" />
            Your money, colorfully organized
          </span>

          <h1 className="mt-6 text-4xl sm:text-6xl font-extrabold tracking-tight">
            Track every rupee.<br />
            <span className="text-gradient">See where it goes.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base sm:text-lg text-muted-foreground">
            Pocket Tracker is a simple, cloud-synced expense manager. Set your budget,
            add spends in seconds, and unlock beautiful insights with charts and graphs
            — all in one delightful place.
          </p>

          <div className="mt-10 flex flex-col items-center gap-3">
            <Link
              to="/dashboard"
              className="group relative inline-flex items-center gap-2 rounded-full bg-gradient-hero px-8 py-4 text-base font-semibold text-white shadow-glow transition-transform hover:scale-105 active:scale-95"
            >
              <span className="absolute inset-0 rounded-full bg-gradient-sunset opacity-0 blur-xl transition-opacity group-hover:opacity-70" />
              <span className="relative">Open your Pocket</span>
              <ArrowRight className="relative h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <p className="text-xs text-muted-foreground">
              New here? You'll be asked to sign in first.
            </p>
          </div>
        </section>

        <section className="mt-20 grid gap-4 sm:grid-cols-3">
          <Feature
            gradient="bg-gradient-hero"
            icon={<Wallet className="h-5 w-5 text-white" />}
            title="Budget & Balance"
            desc="Set a total, log expenses, and always see what's remaining."
          />
          <Feature
            gradient="bg-gradient-sunset"
            icon={<PieChart className="h-5 w-5 text-white" />}
            title="Colorful Insights"
            desc="Interactive charts and graphs reveal your spending patterns."
          />
          <Feature
            gradient="bg-gradient-mint"
            icon={<ShieldCheck className="h-5 w-5 text-white" />}
            title="Private & Secure"
            desc="Your data is safely stored in the cloud, protected per user."
          />
        </section>
      </main>
    </div>
  );
}

function Feature({
  icon,
  title,
  desc,
  gradient,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  gradient: string;
}) {
  return (
    <div className="group rounded-2xl border bg-card/80 backdrop-blur p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-glow">
      <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${gradient} shadow-glow`}>
        {icon}
      </div>
      <h3 className="mt-4 text-base font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}
