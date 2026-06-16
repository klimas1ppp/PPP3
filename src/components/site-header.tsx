"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { WalletButton } from "@/components/wallet-button";

const NAV = [
  { label: "How it works", href: "/#how" },
  { label: "Yield", href: "/#yield" },
  { label: "Impact", href: "/#impact" },
  { label: "Contact", href: "/contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeHash, setActiveHash] = useState("");
  const pathname = usePathname();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (pathname !== "/") {
      setActiveHash("");
      return;
    }
    const ids = NAV.filter((n) => n.href.startsWith("/#")).map((n) => n.href.slice(2));
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveHash(`/#${entry.target.id}`);
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [pathname]);

  const isActive = (item: (typeof NAV)[number]) =>
    item.href.startsWith("/#")
      ? pathname === "/" && activeHash === item.href
      : pathname === item.href || pathname.startsWith(`${item.href}/`);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/40 bg-background/70 backdrop-blur-md">
      <div
        className={`mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 transition-[height] duration-300 ease-out sm:px-6 ${
          scrolled ? "h-[3.5rem]" : "h-[5rem]"
        }`}
      >
        <Link
          href="/"
          className="flex items-center gap-3"
          onClick={() => setOpen(false)}
        >
          <Image
            src="/images/ppp-infinity-tree.png"
            alt="PPP infinity tree logo"
            width={231}
            height={231}
            priority
            className={`my-0.5 w-auto rounded-xl shadow-[0_0_18px_oklch(0.79_0.13_88_/_0.25)] ring-1 ring-gold/20 transition-[height] duration-300 ease-out ${
              scrolled ? "h-[3.25rem]" : "h-[4.75rem]"
            }`}
          />
          <span className="font-heading text-xl font-semibold tracking-wide text-gold">
            PPP
          </span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {NAV.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`text-sm underline-offset-8 transition-colors ${
                  active
                    ? "font-semibold text-gold underline decoration-gold/70"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />

          <div className="hidden lg:block">
            <WalletButton />
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-border/60 bg-card/40 text-foreground transition-colors hover:border-gold/50 lg:hidden"
          >
            {open ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {open && (
        <div
          className={`fixed inset-0 z-40 bg-background/80 backdrop-blur-sm transition-[top] duration-300 ease-out lg:hidden ${
            scrolled ? "top-[3.5rem]" : "top-[5rem]"
          }`}
          onClick={() => setOpen(false)}
        >
          <nav
            id="mobile-menu"
            className="mx-4 mt-2 flex flex-col gap-1 rounded-2xl border border-border/60 bg-card p-4 shadow-[0_24px_60px_-20px_oklch(0_0_0_/_0.6)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-2 flex justify-center [&_button]:w-full">
              <WalletButton />
            </div>
            {NAV.map((item) => {
              const active = isActive(item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-xl px-4 py-3 text-base font-medium underline-offset-4 transition-colors ${
                    active
                      ? "bg-primary/15 text-gold"
                      : "text-muted-foreground hover:bg-background/60 hover:text-gold"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
