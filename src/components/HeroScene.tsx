"use client";

import dynamic from "next/dynamic";

const HeroScene3D = dynamic(() => import("./HeroScene3D"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center" aria-hidden="true">
      <span className="h-40 w-40 animate-pulse rounded-full bg-brand-600/20 blur-3xl" />
    </div>
  ),
});

export default function HeroScene() {
  return <HeroScene3D />;
}
