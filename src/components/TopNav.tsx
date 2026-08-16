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
    <header className="border-b border-border bg-background/70 backdrop-blur sticky top-0 z-10">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-6">
        <Link href="/" className="font-display font-semibold tracking-tight text-lg shrink-0">
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
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent"
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
            <span className="hidden sm:inline text-muted-foreground">
              Viewing as {section === "parent" ? "Parent" : "Child"}
            </span>
          )}
          <Link
            href="/"
            className="px-3 py-1.5 rounded-full border border-border hover:bg-accent"
          >
            Switch view
          </Link>
        </div>
      </div>
    </header>
  );
}
