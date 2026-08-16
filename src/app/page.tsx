export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-6 font-sans dark:bg-black">
      <main className="flex w-full max-w-xl flex-col items-start gap-6">
        <span className="rounded-full border border-black/10 px-3 py-1 text-xs font-medium tracking-wide text-zinc-600 uppercase dark:border-white/15 dark:text-zinc-400">
          Work in progress
        </span>
        <h1 className="text-4xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Eldercare
        </h1>
        <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          The app is set up and running. Start building by editing{" "}
          <code className="rounded bg-black/[.06] px-1.5 py-0.5 font-mono text-[0.9em] dark:bg-white/[.08]">
            src/app/page.tsx
          </code>
          .
        </p>
      </main>
    </div>
  );
}
