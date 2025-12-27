"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Menu, X, Film, Search, List, LogIn, LogOut, User } from "lucide-react";
import { LanguageSwitcher } from "./language-switcher";

interface NavbarProps {
  user: { id: string; email: string; name: string | null } | null;
  locale: string;
}

export function Navbar({ user, locale }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations("nav");

  const navLinks = [
    { href: `/${locale}`, label: t("home"), icon: Film },
    { href: `/${locale}/search`, label: t("search"), icon: Search },
    ...(user
      ? [{ href: `/${locale}/watchlist`, label: t("watchlist"), icon: List }]
      : []),
  ];

  const isActive = (href: string) => {
    if (href === `/${locale}`) {
      return pathname === `/${locale}` || pathname === `/${locale}/`;
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="glass fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href={`/${locale}`}
            className="flex items-center gap-2 text-xl font-bold"
          >
            <Film className="w-6 h-6 text-[var(--color-accent)]" />
            <span className="text-gradient">Movies Tracker</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    isActive(link.href)
                      ? "text-[var(--color-accent)] bg-[var(--color-accent-muted)]"
                      : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}

            <LanguageSwitcher locale={locale} />

            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
                  <User className="w-4 h-4" />
                  <span>{user.name || user.email}</span>
                </div>
                <form action={`/${locale}/logout`}>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    {t("logout")}
                  </button>
                </form>
              </div>
            ) : (
              <Link
                href={`/${locale}/login`}
                className="btn-primary flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                {t("login")}
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden glass border-t border-[var(--border-color)]">
          <div className="px-4 py-4 space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(link.href)
                      ? "text-[var(--color-accent)] bg-[var(--color-accent-muted)]"
                      : "text-[var(--foreground-muted)] hover:bg-[var(--background-secondary)]"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {link.label}
                </Link>
              );
            })}

            <div className="pt-4 border-t border-[var(--border-color)]">
              <LanguageSwitcher locale={locale} />
            </div>

            <div className="pt-4 border-t border-[var(--border-color)]">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-4 text-sm text-[var(--foreground-muted)]">
                    <User className="w-4 h-4" />
                    <span>{user.name || user.email}</span>
                  </div>
                  <form action={`/${locale}/logout`}>
                    <button
                      type="submit"
                      className="flex items-center gap-2 w-full px-4 py-3 rounded-lg text-[var(--foreground-muted)] hover:bg-[var(--background-secondary)]"
                    >
                      <LogOut className="w-5 h-5" />
                      {t("logout")}
                    </button>
                  </form>
                </div>
              ) : (
                <Link
                  href={`/${locale}/login`}
                  onClick={() => setIsOpen(false)}
                  className="btn-primary flex items-center justify-center gap-2 w-full"
                >
                  <LogIn className="w-4 h-4" />
                  {t("login")}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
