"use client";

import { useRef, useState } from "react";
import { Phone, Wrench } from "lucide-react";
import Reveal from "./Reveal";

export type Technician = {
  id: string;
  name: string;
  phone: string;
  role: string;
  area: string;
  accent: string;
  initials: string;
};

/**
 * A friendly SVG technician. The head and eyes follow the pointer, the arm
 * waves on hover, and the whole character springs when the card is hovered.
 */
function Character({ accent, initials }: { accent: string; initials: string }) {
  const groupRef = useRef<SVGGElement>(null);
  const headRef = useRef<SVGGElement>(null);
  const eyeLeftRef = useRef<SVGCircleElement>(null);
  const eyeRightRef = useRef<SVGCircleElement>(null);
  const armRef = useRef<SVGGElement>(null);

  function handleMove(event: React.MouseEvent<SVGSVGElement>) {
    const svg = event.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    if (headRef.current) {
      headRef.current.style.transform = `translate(${x * 10}px, ${y * 7}px) rotate(${x * 10}deg)`;
      headRef.current.style.transformOrigin = "60px 86px";
    }
    if (eyeLeftRef.current && eyeRightRef.current) {
      eyeLeftRef.current.setAttribute("cx", String(52 + x * 5));
      eyeLeftRef.current.setAttribute("cy", String(80 + y * 4));
      eyeRightRef.current.setAttribute("cx", String(70 + x * 5));
      eyeRightRef.current.setAttribute("cy", String(80 + y * 4));
    }
    if (groupRef.current) {
      groupRef.current.style.transform = `translate(${x * 6}px, ${y * 4}px)`;
    }
  }

  function handleLeave() {
    if (headRef.current) headRef.current.style.transform = "translate(0px, 0px) rotate(0deg)";
    if (groupRef.current) groupRef.current.style.transform = "translate(0px, 0px)";
    if (eyeLeftRef.current) {
      eyeLeftRef.current.setAttribute("cx", "52");
      eyeLeftRef.current.setAttribute("cy", "80");
    }
    if (eyeRightRef.current) {
      eyeRightRef.current.setAttribute("cx", "70");
      eyeRightRef.current.setAttribute("cy", "80");
    }
  }

  return (
    <svg
      viewBox="0 0 120 130"
      className="tech-character"
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`body-${accent.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accent} />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.85" />
        </linearGradient>
      </defs>

      <ellipse cx="60" cy="122" rx="34" ry="5" fill="#0b0b0b" opacity="0.08" />

      <g ref={groupRef} style={{ transition: "transform 0.25s ease" }}>
        {/* body */}
        <path
          d="M38 96c0-9 10-14 22-14s22 5 22 14v20H38z"
          fill={`url(#body-${accent.replace("#", "")})`}
          stroke={accent}
          strokeWidth="2.5"
        />
        {/* tool belt */}
        <rect x="40" y="104" width="40" height="7" rx="3" fill={accent} opacity="0.9" />
        <circle cx="60" cy="107" r="2.4" fill="#fff" />

        {/* legs */}
        <rect x="44" y="114" width="9" height="10" rx="4" fill="#2b2b2b" />
        <rect x="67" y="114" width="9" height="10" rx="4" fill="#2b2b2b" />

        {/* waving arm */}
        <g ref={armRef} className="tech-arm">
          <rect x="20" y="92" width="8" height="22" rx="4" fill={accent} />
          <circle cx="24" cy="88" r="6" fill="#ffd9b3" />
        </g>
        <rect x="92" y="92" width="8" height="22" rx="4" fill={accent} />
        <circle cx="96" cy="88" r="6" fill="#ffd9b3" />

        {/* head */}
        <g ref={headRef} style={{ transition: "transform 0.2s ease" }}>
          <circle cx="60" cy="74" r="24" fill="#ffd9b3" stroke={accent} strokeWidth="2.5" />
          {/* hair / cap */}
          <path d="M36 70a24 24 0 0 1 48 0c0-6-8-10-24-10S36 64 36 70z" fill={accent} />
          {/* eyes */}
          <circle ref={eyeLeftRef} cx="52" cy="80" r="3.2" fill="#1b1b1b" />
          <circle ref={eyeRightRef} cx="70" cy="80" r="3.2" fill="#1b1b1b" />
          {/* smile */}
          <path d="M52 90c3 4 13 4 16 0" stroke="#1b1b1b" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* wifi antenna */}
          <rect x="58" y="38" width="4" height="14" rx="2" fill={accent} />
          <circle cx="60" cy="36" r="4" fill={accent} />
          <path d="M52 30a12 12 0 0 1 16 0" stroke={accent} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M48 24a20 20 0 0 1 24 0" stroke={accent} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </g>

        {/* initials badge */}
        <circle cx="60" cy="102" r="9" fill="#fff" stroke={accent} strokeWidth="2" />
        <text
          x="60"
          y="105.5"
          textAnchor="middle"
          fontSize="9"
          fontWeight="700"
          fill={accent}
          fontFamily="system-ui, sans-serif"
        >
          {initials}
        </text>
      </g>
    </svg>
  );
}

export default function Technicians({
  technicians,
  intro,
  areaNote,
  ctaLabel,
}: {
  technicians: Technician[];
  intro: string;
  areaNote: string;
  ctaLabel: string;
}) {
  const [active, setActive] = useState<string | null>(null);
  if (!technicians.length) return null;

  return (
    <section id="team" className="bg-ink py-20 text-white md:py-24">
      <div className="container-x">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-brand-400">Our crew</p>
          <h2 className="display mt-2 text-3xl md:text-4xl">Real people, not call centres</h2>
          <p className="mt-3 max-w-2xl text-white/70">{intro}</p>
          <p className="mt-1 text-sm text-white/50">{areaNote}</p>
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {technicians.map((technician, index) => (
            <Reveal key={technician.id} delay={index * 80}>
              <article
                onMouseEnter={() => setActive(technician.id)}
                onMouseLeave={() => setActive(null)}
                className={`tech-card group relative h-full overflow-hidden rounded-[var(--radius-card)] border p-6 text-center transition-all duration-300 ${
                  active === technician.id
                    ? "-translate-y-2 border-transparent shadow-[0_30px_60px_-30px_rgba(230,0,0,0.8)]"
                    : "border-white/10 bg-white/5"
                }`}
                style={active === technician.id ? { background: `linear-gradient(180deg, ${technician.accent}22, #ffffff08)` } : undefined}
              >
                <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-40 blur-2xl transition-opacity duration-300"
                  style={{ background: technician.accent, opacity: active === technician.id ? 0.5 : 0.15 }}
                />

                <div className="relative mx-auto h-40 w-40">
                  <Character accent={technician.accent} initials={technician.initials} />
                </div>

                <h3 className="relative mt-4 text-lg font-bold text-white">{technician.name}</h3>
                <p className="relative text-sm" style={{ color: technician.accent }}>
                  {technician.role}
                </p>
                <p className="relative mt-1 text-xs text-white/50">{technician.area}</p>

                <div className="relative mt-5 flex flex-col gap-2">
                  <a
                    href={`tel:${technician.phone}`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                  >
                    <Phone size={15} />
                    {technician.phone}
                  </a>
                  <a
                    href={`https://wa.me/${technician.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/20"
                  >
                    <Wrench size={15} />
                    Ask for {technician.name.split(" ")[0]} on WhatsApp
                  </a>
                </div>

                <p className="relative mt-4 text-[0.65rem] uppercase tracking-[0.18em] text-white/35">
                  {ctaLabel} — mention their name
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
