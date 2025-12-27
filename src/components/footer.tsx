import { Film } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto py-8 border-t border-[var(--border-color)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-[var(--color-accent)]" />
            <span className="text-gradient font-semibold">Movies Tracker</span>
          </div>

          <div className="flex items-center gap-4 text-sm text-[var(--foreground-muted)]">
            <a
              href="https://www.themoviedb.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-[var(--color-accent)] transition-colors"
            >
              <span>Powered by</span>
              <svg
                viewBox="0 0 190 15"
                className="h-3 fill-current"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M0.5 0.939453H3.85156V11.5H8.69531V14.5H0.5V0.939453Z" />
                <path d="M12.5 0.939453H15.8516V14.5H12.5V0.939453Z" />
                <path d="M20.5 0.939453H23.8516V11.5H28.6953V14.5H20.5V0.939453Z" />
                <path d="M32.5 0.939453H35.8516V14.5H32.5V0.939453Z" />
                <path d="M40.5 0.939453H48.5V3.93945H43.8516V6.06055H48.1953V9.06055H43.8516V11.5H48.6953V14.5H40.5V0.939453Z" />
                <path d="M57.4961 14.5H54.1445L52.5 0.939453H55.7539L56.6992 10.0605H56.7969L58.4961 0.939453H61.3047L63.1016 10.0605H63.1992L64.1445 0.939453H67.5L65.7539 14.5H62.4023L60.5039 5.25H60.4062L57.4961 14.5Z" />
                <path d="M71.5 0.939453H79.5V3.93945H74.8516V6.06055H79.1953V9.06055H74.8516V11.5H79.6953V14.5H71.5V0.939453Z" />
                <path d="M92.3984 14.5H88.7461L85.5 0.939453H89.0508L90.5977 8.5H90.6953L92.2422 0.939453H95.7461L92.3984 14.5Z" />
                <path d="M99.5 0.939453H107.5V3.93945H102.852V6.06055H107.195V9.06055H102.852V11.5H107.695V14.5H99.5V0.939453Z" />
              </svg>
            </a>
          </div>

          <p className="text-sm text-[var(--foreground-subtle)]">
            © {currentYear} Movies Tracker. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
