import { Link } from "react-router-dom";

export default function PublicFooter() {
  return (
    <footer className="bg-white border-t border-[#1B5E3F]/10 py-12 sm:py-16 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2">
            <img
              src="/Expglo fund logo.jpeg"
              alt="EXPGLO"
              className="h-10 mb-3 mix-blend-multiply"
            />
            <p className="text-sm text-[#0A1F14]/65 max-w-xs">
              Where great ideas meet the capital to change the world.
            </p>
          </div>
          <FooterCol
            title="Platform"
            items={[
              { label: "For founders", href: "#" },
              { label: "For investors", href: "#" },
              { label: "Courses", href: "/courses", to: true },
            ]}
          />
          <FooterCol
            title="Company"
            items={[
              { label: "About", href: "#" },
              { label: "Blog", href: "#" },
              { label: "Privacy", href: "#" },
              { label: "Terms", href: "#" },
            ]}
          />
        </div>
        <div className="pt-7 border-t border-[#1B5E3F]/10 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-[#0A1F14]/55">
          <p>© 2026 EXPGLO FUND. All rights reserved.</p>
          <p>Built for founders, backed by conviction.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }) {
  return (
    <div>
      <h5 className="text-xs uppercase tracking-wider font-bold text-[#0F4A2E] mb-3">
        {title}
      </h5>
      <ul className="space-y-2">
        {items.map((it) =>
          it.to ? (
            <li key={it.label}>
              <Link
                to={it.href}
                className="text-sm text-[#0A1F14]/65 hover:text-[#1B5E3F] transition-colors"
              >
                {it.label}
              </Link>
            </li>
          ) : (
            <li key={it.label}>
              <a
                href={it.href}
                className="text-sm text-[#0A1F14]/65 hover:text-[#1B5E3F] transition-colors"
              >
                {it.label}
              </a>
            </li>
          ),
        )}
      </ul>
    </div>
  );
}
