import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/lib/actions";
import { RegisterForm } from "./register-form";
import { Film } from "lucide-react";
import Link from "next/link";

interface RegisterPageProps {
  params: Promise<{ locale: string }>;
}

export default async function RegisterPage({ params }: RegisterPageProps) {
  const { locale } = await params;
  const t = await getTranslations("auth");
  const user = await getCurrentUser();

  if (user) {
    redirect(`/${locale}`);
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="glass rounded-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Film className="w-12 h-12 text-[var(--color-accent)]" />
            </div>
            <h1 className="text-2xl font-bold">{t("register")}</h1>
          </div>

          {/* Form */}
          <RegisterForm locale={locale} />

          {/* Login Link */}
          <p className="mt-6 text-center text-sm text-[var(--foreground-muted)]">
            {t("hasAccount")}{" "}
            <Link
              href={`/${locale}/login`}
              className="text-[var(--color-accent)] hover:underline"
            >
              {t("login")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
