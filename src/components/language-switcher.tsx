"use client";

import { usePathname, useRouter } from "next/navigation";
import { Globe } from "lucide-react";

const locales = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "ca", label: "Català", flag: "🏴" },
];

interface LanguageSwitcherProps {
  locale: string;
}

export function LanguageSwitcher({ locale }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleChange = (newLocale: string) => {
    // Replace the current locale in the pathname with the new one
    const segments = pathname.split("/");
    segments[1] = newLocale;
    const newPath = segments.join("/");
    router.push(newPath);
  };

  const currentLocale = locales.find((l) => l.code === locale);

  return (
    <div className="relative group">
      <button
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
        aria-label="Change language"
      >
        <Globe className="w-4 h-4" />
        <span>{currentLocale?.flag}</span>
      </button>

      <div className="absolute right-0 top-full mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="glass rounded-lg overflow-hidden min-w-[140px]">
          {locales.map((loc) => (
            <button
              key={loc.code}
              onClick={() => handleChange(loc.code)}
              className={`flex items-center gap-3 w-full px-4 py-3 text-left transition-colors ${
                loc.code === locale
                  ? "text-[var(--color-accent)] bg-[var(--color-accent-muted)]"
                  : "text-[var(--foreground-muted)] hover:bg-[var(--background-secondary)]"
              }`}
            >
              <span>{loc.flag}</span>
              <span className="text-sm">{loc.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
