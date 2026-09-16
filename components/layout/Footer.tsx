import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { CATEGORIES, FOOTER_LINKS } from "@/config/navigation";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-zinc-950 text-zinc-300 border-t border-zinc-800 pt-12 pb-8 mt-20">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-zinc-800">
          {/* Brand & Mission column */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block">
              <span className="font-editorial text-3xl font-black tracking-widest text-white uppercase select-none">
                GNOSIS
              </span>
            </Link>
            <p className="mt-3 text-sm text-zinc-400 max-w-sm leading-relaxed">
              An independent global news publication dedicated to verified, structured, and insightful reporting across international developments, policy, science, and culture.
            </p>
            <div className="mt-4 text-xs text-zinc-500">
              Published for an international English-speaking readership.
            </div>
          </div>

          {/* Primary News Sections */}
          <div>
            <h3 className="text-xs uppercase font-bold tracking-widest text-white mb-4">
              News Sections
            </h3>
            <ul className="space-y-2 text-sm text-zinc-400">
              {CATEGORIES.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/${cat.slug}`}
                    className="hover:text-white transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Editorial Standards */}
          <div>
            <h3 className="text-xs uppercase font-bold tracking-widest text-white mb-4">
              Editorial Policy
            </h3>
            <ul className="space-y-2 text-sm text-zinc-400">
              {FOOTER_LINKS.editorial.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal / Compliance */}
          <div>
            <h3 className="text-xs uppercase font-bold tracking-widest text-white mb-4">
              Legal & Privacy
            </h3>
            <ul className="space-y-2 text-sm text-zinc-400">
              {FOOTER_LINKS.legal.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom copyright bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
          <p>© {currentYear} GNOSIS Media Group. All rights reserved.</p>
          <p>Phase 1 Architecture Foundation — Editorial & Design System</p>
        </div>
      </Container>
    </footer>
  );
}
