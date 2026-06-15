"use client";

import { useEffect, useMemo, useState } from "react";

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

function useScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const next = max > 0 ? easeOutCubic(clamp(window.scrollY / max, 0, 1)) : 0;
      setProgress((prev) => (Math.abs(prev - next) < 0.001 ? prev : next));
    };

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return progress;
}

function vineOffset(progress: number, index: number) {
  const delay = index * 0.06;
  const len = 0.55 + (index % 3) * 0.08;
  const t = clamp((progress - delay) / len, 0, 1);
  return 1 - easeOutCubic(t);
}

const VINE_PATHS = [
  "M 50 58 C 38 52, 22 44, 12 32 S 4 18, 8 8",
  "M 50 58 C 62 52, 78 42, 88 28 S 96 12, 92 6",
  "M 50 58 C 42 66, 28 78, 18 88 S 6 96, 4 98",
  "M 50 58 C 58 66, 72 80, 82 90 S 94 97, 96 99",
  "M 50 58 C 46 72, 44 84, 50 94 S 56 99, 50 100",
  "M 50 58 C 34 60, 18 58, 8 52 S 2 42, 6 34",
  "M 50 58 C 66 60, 82 56, 92 48 S 98 36, 94 28",
  "M 50 58 C 36 54, 24 48, 16 38 C 10 30, 14 22, 22 16",
  "M 50 58 C 64 54, 76 46, 84 36 C 90 28, 86 20, 78 14",
];

const PAGE_VINE_PATHS = [
  "M 50 5 C 42 45, 38 90, 32 140 S 22 230, 28 310 S 18 370, 35 395",
  "M 50 5 C 58 50, 62 100, 68 150 S 78 240, 72 320 S 82 375, 65 395",
  "M 50 5 C 46 70, 52 140, 48 200 S 55 280, 50 340 S 45 380, 50 395",
  "M 50 5 C 32 60, 18 120, 12 180 S 6 260, 18 330 S 8 375, 22 395",
  "M 50 5 C 68 55, 82 115, 88 175 S 94 255, 80 325 S 92 372, 78 395",
  "M 50 5 C 40 100, 60 180, 38 240 S 62 300, 42 360",
  "M 50 5 C 55 80, 45 160, 58 220 S 40 290, 55 350",
  "M 50 5 C 28 40, 72 55, 25 95 S 75 110, 30 150 S 70 165, 35 200 S 80 215, 40 250 S 75 265, 45 300 S 85 315, 50 350",
];

const ORBITS = [
  { cx: 50, cy: 48, rx: 32, ry: 20, className: "scroll-tree-orbit-1" },
  { cx: 50, cy: 48, rx: 38, ry: 26, className: "scroll-tree-orbit-2" },
  { cx: 50, cy: 48, rx: 44, ry: 30, className: "scroll-tree-orbit-3" },
];

function StarField() {
  const stars = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        left: `${(i * 17.3 + 7) % 100}%`,
        top: `${(i * 23.7 + 11) % 100}%`,
        size: 1 + (i % 3),
        delay: `${(i % 12) * 0.4}s`,
        duration: `${2.5 + (i % 5) * 0.6}s`,
        drift: `${14 + (i % 6) * 3}s`,
      })),
    []
  );

  return (
    <div className="scroll-tree-stars" aria-hidden>
      {stars.map((s) => (
        <span
          key={s.id}
          className="scroll-tree-star"
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            animationDelay: s.delay,
            ["--star-drift" as string]: s.drift,
            ["--star-duration" as string]: s.duration,
          }}
        />
      ))}
    </div>
  );
}

function FloatingEmbers() {
  const embers = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        id: i,
        left: `${46 + (i % 5) * 2.5 + (i % 3)}%`,
        delay: `${i * 1.1}s`,
        duration: `${4.5 + (i % 4) * 1.2}s`,
        size: 2 + (i % 2),
        drift: `${(i % 5 - 2) * 12}px`,
      })),
    []
  );

  return (
    <div className="scroll-tree-embers" aria-hidden>
      {embers.map((e) => (
        <span
          key={e.id}
          className="scroll-tree-ember"
          style={{
            left: e.left,
            width: e.size,
            height: e.size,
            animationDelay: e.delay,
            animationDuration: e.duration,
            ["--ember-drift" as string]: e.drift,
          }}
        />
      ))}
    </div>
  );
}

/** Single mount: one scroll listener, fixed + page vine layers */
export function ScrollTreeBg() {
  const progress = useScrollProgress();

  const scale = 0.18 + progress * 0.82;
  const opacity = 0.45 + progress * 0.4;
  const glow = 0.55 + progress * 0.45;
  const saplingOpacity = clamp(1 - progress * 2.5, 0, 1);
  const treeOpacity = clamp((progress - 0.04) / 0.28, 0, 1);
  const reveal = clamp(progress * 1.05, 0, 1);
  const vineStrength = 0.2 + progress * 0.8;
  const pageVineStrength = 0.15 + progress * 0.85;
  const orbitOpacity = 0.15 + progress * 0.25;

  return (
    <>
      <div className="scroll-tree-bg" aria-hidden>
        <div className="scroll-tree-mist" />
        <StarField />

        <svg className="scroll-tree-orbits" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
          {ORBITS.map((o) => (
            <g key={o.className} className={`scroll-tree-orbit-wrap ${o.className}`} style={{ opacity: orbitOpacity }}>
              <ellipse cx={o.cx} cy={o.cy} rx={o.rx} ry={o.ry} className="scroll-tree-orbit" />
            </g>
          ))}
        </svg>

        <svg className="scroll-tree-vines" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <filter id="vine-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="0.35" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {VINE_PATHS.map((d, i) => (
            <path
              key={i}
              d={d}
              pathLength={1}
              className="scroll-tree-vine"
              style={{
                strokeDashoffset: vineOffset(progress, i),
                opacity: vineStrength * (0.35 + (i % 4) * 0.12),
              }}
            />
          ))}
        </svg>

        <div className="scroll-tree-orbs">
          <span className="scroll-tree-orb scroll-tree-orb-a" />
          <span className="scroll-tree-orb scroll-tree-orb-b" />
          <span className="scroll-tree-orb scroll-tree-orb-c" />
        </div>

        <div
          className="scroll-tree-stage"
          style={
            {
              "--tree-scale": scale,
              "--tree-opacity": opacity,
              "--tree-glow": glow,
              "--tree-reveal": reveal,
            } as React.CSSProperties
          }
        >
          <div className="scroll-tree-float">
            <FloatingEmbers />
            <div className="scroll-tree-halo" />
            <div className="scroll-tree-ground" />

            <div
              className="scroll-tree-sapling"
              style={{ opacity: saplingOpacity, visibility: saplingOpacity < 0.02 ? "hidden" : "visible" }}
            >
              <svg viewBox="0 0 40 80" className="scroll-tree-sapling-svg" aria-hidden>
                <path
                  d="M20 78 C18 60 16 45 20 30 C22 20 18 12 20 4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <ellipse cx="20" cy="8" rx="6" ry="9" fill="currentColor" opacity="0.8" />
              </svg>
            </div>

            <div
              className="scroll-tree-full"
              style={{ opacity: treeOpacity, visibility: treeOpacity < 0.02 ? "hidden" : "visible" }}
            >
              <div className="scroll-tree-shimmer" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-mark-gold.svg" alt="" className="scroll-tree-img" draggable={false} />
            </div>
          </div>
        </div>
      </div>

      <div className="scroll-tree-vines-page" aria-hidden>
        <svg className="scroll-tree-vines-page-svg" viewBox="0 0 100 400" preserveAspectRatio="none">
          <defs>
            <filter id="vine-glow-page" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="0.3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {PAGE_VINE_PATHS.map((d, i) => (
            <path
              key={i}
              d={d}
              pathLength={1}
              className="scroll-tree-vine scroll-tree-vine-page"
              style={{
                strokeDashoffset: vineOffset(progress, i + 2),
                opacity: pageVineStrength * (0.3 + (i % 4) * 0.08),
              }}
            />
          ))}
        </svg>
      </div>
    </>
  );
}
