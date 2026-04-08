"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "⊞" },
  { href: "/admin/bookings", label: "Bookinger", icon: "📋" },
  { href: "/admin/slots", label: "Tider", icon: "🕐" },
  { href: "/admin/settings", label: "Indstillinger", icon: "⚙" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/session", { method: "DELETE" });
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-[#faf6f3]">
      {/* Top nav */}
      <header className="bg-white border-b border-rose-100 px-4 sm:px-8 py-4 flex items-center justify-between">
        <span className="font-display font-medium text-gray-800 text-lg">
          Negleklinik Admin
        </span>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-rose-500 transition"
        >
          Log ud
        </button>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="hidden sm:flex flex-col w-52 bg-white border-r border-rose-100 min-h-[calc(100vh-65px)] p-4 gap-1">
          {NAV.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-medium transition-colors",
                pathname === href
                  ? "bg-rose-50 text-rose-600"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              )}
            >
              <span>{icon}</span>
              {label}
            </Link>
          ))}
        </nav>

        {/* Mobile bottom nav */}
        <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-rose-100 flex z-10">
          {NAV.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex-1 flex flex-col items-center py-3 text-xs gap-1 transition-colors",
                pathname === href ? "text-rose-500" : "text-gray-400"
              )}
            >
              <span className="text-lg">{icon}</span>
              {label}
            </Link>
          ))}
        </nav>

        {/* Main */}
        <main className="flex-1 p-4 sm:p-8 pb-24 sm:pb-8">{children}</main>
      </div>
    </div>
  );
}
