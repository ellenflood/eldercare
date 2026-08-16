import Link from "next/link";
import { getChild, getParent } from "@/lib/store";

export const dynamic = "force-dynamic";

export default function Home() {
  const parent = getParent();
  const child = getChild();

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <main className="w-full max-w-xl flex flex-col items-center text-center gap-6">
        <span className="rounded-full border border-border px-3 py-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Demo v1
        </span>
        <h1 className="text-4xl font-semibold tracking-tight">WithYou</h1>
        <p className="text-muted-foreground max-w-md">Every step of the way...</p>

        <div className="grid sm:grid-cols-2 gap-4 w-full mt-4">
          <Link
            href="/parent"
            className="rounded-2xl border border-border bg-card p-6 text-left hover:border-ring/50 transition-colors"
          >
            <p className="text-xs uppercase tracking-wide text-muted-foreground">View as</p>
            <p className="text-lg font-semibold mt-1">Parent</p>
            <p className="text-sm text-muted-foreground mt-1">{parent.name}, {parent.age}</p>
          </Link>
          <Link
            href="/child"
            className="rounded-2xl border border-border bg-card p-6 text-left hover:border-ring/50 transition-colors"
          >
            <p className="text-xs uppercase tracking-wide text-muted-foreground">View as</p>
            <p className="text-lg font-semibold mt-1">Child</p>
            <p className="text-sm text-muted-foreground mt-1">{child.name}, {child.age}</p>
          </Link>
        </div>

        <Link href="/signup" className="text-sm text-muted-foreground hover:text-foreground underline mt-2">
          Or start the signup flow →
        </Link>
      </main>
    </div>
  );
}
