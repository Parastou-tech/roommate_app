"use client";

import Image from "next/image";
import prepPairLogo from "@/style/logo.png";

export default function BrandLogo() {
  return (
    <div className="brand-logo" aria-label="Prep Pair">
      <div className="brand-oval">
        <Image src={prepPairLogo} alt="Prep Pair logo" fill priority className="brand-logo-image" />
      </div>
    </div>
  );
}
