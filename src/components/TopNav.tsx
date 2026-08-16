"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const PARENT_LINKS = [
  { href: "/parent", label: "Dashboard" },
  { href: "/parent/calendar", label: "Calendar" },
  { href: "/parent/appointments", label: "Appointments" },
  { href: "/parent/prescriptions", label: "Prescriptions" },
  { href: "/parent/documents", label: "Documents" },
  { href: "/parent/account", label: "Account" },
];

const CHILD_LINKS = [
  { href: "/child", label: "Dashboard" },
  { href: "/child/account", label: "Account" },
];

export default function TopNav() {
  const pathname = usePathname();
  const section = pathname.startsWith("/parent") ? "parent" : pathname.startsWith("/child") ? "child" : null;
  const links = section === "parent" ? PARENT_LINKS : section === "child" ? CHILD_LINKS : [];

  return (
    <header className="border-b border-black/10 dark:border-white/10 bg-white/70 dark:bg-black/30 backdrop-blur sticky top-0 z-10">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-6">
        <Link href="/" className="font-semibold tracking-tight text-lg shrink-0">
          Eldercare
        </Link>

        {links.length > 0 && (
          <nav className="flex items-center gap-1 overflow-x-auto text-sm">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
                    active
                      ? "bg-black text-white dark:bg-white dark:text-black"
                      : "text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/10"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        )}

        <div className="ml-auto flex items-center gap-2 text-sm shrink-0">
          {section && (
            <span className="hidden sm:inline text-black/40 dark:text-white/40">
              Viewing as {section === "parent" ? "Parent" : "Child"}
            </span>
          )}
          <Link
            href="/"
            className="px-3 py-1.5 rounded-full border border-black/15 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/10"
          >
            Switch view
          </Link>
        </div>
      </div>
    </header>
  );
}
