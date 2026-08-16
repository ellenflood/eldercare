import Image from "next/image";
import Link from "next/link";
import { getChild, getParent } from "@/lib/store";

export const dynamic = "force-dynamic";

export default function Home() {
  const parent = getParent();
  const child = getChild();

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-16">
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/hero-care.jpg"
          alt=""
          fill
          priority
          className="scale-110 object-cover object-[70%_30%] blur-md opacity-80 dark:opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/60 to-background" />
      </div>

      <main className="w-full max-w-xl flex flex-col items-center text-center gap-6">
        <span className="rounded-full border border-border px-3 py-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Demo v1
        </span>
        <h1 className="text-[3.375rem] font-semibold tracking-tight text-green-900 dark:text-green-400">WithYou</h1>
        <p className="text-muted-foreground max-w-md">Care management wherever you are</p>

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
