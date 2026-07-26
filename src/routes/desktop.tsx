import { createFileRoute, Link } from "@tanstack/react-router";

import winAsset from "@/assets/downloads/PocketTracker-windows-x64.zip.asset.json";
import macAsset from "@/assets/downloads/PocketTracker-macos-x64.zip.asset.json";
import linuxAsset from "@/assets/downloads/PocketTracker-linux-x64.tar.gz.asset.json";

export const Route = createFileRoute("/desktop")({
  head: () => ({
    meta: [
      { title: "Download MySpend for desktop" },
      {
        name: "description",
        content:
          "Install MySpend as a native desktop app on Windows, macOS or Linux and track your spending from your laptop.",
      },
      { property: "og:title", content: "Download MySpend for desktop" },
      {
        property: "og:description",
        content: "Native MySpend desktop app for Windows, macOS and Linux — same account, same data.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DesktopPage,
});

const mb = (bytes: number) => `${Math.round(bytes / 1024 / 1024)} MB`;

const builds = [
  {
    os: "Windows",
    note: "Windows 10 & 11 · 64-bit",
    asset: winAsset,
    steps: [
      "Unzip the folder anywhere you like.",
      "Open “Pocket Tracker.exe”.",
      "Right-click it → Pin to taskbar to keep it handy.",
    ],
    glow: "bg-gradient-hero",
  },
  {
    os: "macOS",
    note: "Intel & Apple Silicon (Rosetta)",
    asset: macAsset,
    steps: [
      "Unzip and drag “Pocket Tracker.app” into Applications.",
      "First launch: right-click → Open (unsigned build).",
      "Keep it in the Dock for one-click access.",
    ],
    glow: "bg-gradient-mint",
  },
  {
    os: "Linux",
    note: "x64 · tar.gz portable",
    asset: linuxAsset,
    steps: [
      "tar -xzf PocketTracker-linux-x64.tar.gz",
      "cd 'Pocket Tracker-linux-x64'",
      "./'Pocket Tracker'",
    ],
    glow: "bg-gradient-sunset",
  },
];

function DesktopPage() {
  return (
    <div className="min-h-screen px-4 py-12 text-foreground">
      <div className="mx-auto max-w-4xl">
        <header className="relative overflow-hidden rounded-3xl border bg-card p-8 text-center shadow-glow">
          <div className="pointer-events-none absolute -top-20 -left-16 h-52 w-52 rounded-full bg-gradient-hero opacity-30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-16 h-52 w-52 rounded-full bg-gradient-mint opacity-30 blur-3xl" />
          <div className="relative">
            <span className="inline-block rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
              Desktop app · v1.0.0
            </span>
            <h1 className="mt-4 text-4xl font-extrabold text-gradient">MySpend on your laptop</h1>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
              A native window with its own app icon — no browser tabs. You sign in with the same
              account, so your budget, expenses and profile stay in sync with the web version.
            </p>
          </div>
        </header>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {builds.map((b) => (
            <div
              key={b.os}
              className="relative overflow-hidden rounded-2xl border bg-card p-5 shadow-glow"
            >
              <div
                className={`pointer-events-none absolute -top-14 -right-10 h-32 w-32 rounded-full opacity-25 blur-2xl ${b.glow}`}
              />
              <div className="relative">
                <h2 className="text-lg font-bold">{b.os}</h2>
                <p className="text-xs text-muted-foreground">{b.note}</p>
                <a
                  href={b.asset.url}
                  download={b.asset.original_filename}
                  className="mt-4 flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  Download · {mb(b.asset.size)}
                </a>
                <ol className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                  {b.steps.map((s) => (
                    <li key={s} className="flex gap-2">
                      <span className="text-primary">›</span>
                      <span className="break-all">{s}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
          <h2 className="mb-2 text-base font-semibold text-foreground">Good to know</h2>
          <ul className="space-y-1.5">
            <li>The desktop app needs internet — your data lives in your account, not on one laptop.</li>
            <li>Google sign-in works inside the app, in its own secure window.</li>
            <li>These are portable builds, so there is no installer to run and nothing to uninstall.</li>
          </ul>
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          <Link to="/" className="hover:underline">
            Back to the web app
          </Link>
        </p>
      </div>
    </div>
  );
}
