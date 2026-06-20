import React from "react";

const BASE_SVG_ASSETS = [
  "assets/Asset 1.svg",
  "assets/d.svg",
  "assets/litecoin-ltc-logo.svg",
  "assets/monero.svg",
  "assets/svg-image-1 (1).svg",
  "assets/svg-image-1 (2).svg",
  "assets/svg-image-1 (3).svg",
  "assets/svg-image-1 (4).svg",
  "assets/svg-image-1 (5).svg",
  "assets/svg-image-1 (6).svg",
  "assets/svg-image-1 (7).svg",
  "assets/svg-image-1 (8).svg",
  "assets/svg-image-1 (9).svg",
  "assets/svg-image-1.svg",
  "assets/tether-usdt-logo.svg"
];

const SVG_ASSETS = BASE_SVG_ASSETS.map(asset => `/regulated-digital-access-tokens/${asset}`);

function MarqueeRow({ items, direction = "left", speed = "40s" }) {
  const doubledItems = [...items, ...items, ...items, ...items];
  const animationClass = direction === "left" ? "animate-marquee-left" : "animate-marquee-right";

  return (
    <div className="marquee-row-wrapper">
      <div 
        className={`marquee-content ${animationClass}`}
        style={{ animationDuration: speed }}
      >
        {doubledItems.map((src, i) => (
          <img 
            key={i} 
            src={src} 
            alt="Asset" 
            className="marquee-svg-item"
            onError={(e) => console.error("Failed to load image at:", src)} 
          />
        ))}
      </div>
    </div>
  );
}

export default function SnakeMarquee() {
  return (
    <div className="snake-marquee-container" style={{ justifyContent: "center" }}>
      {/* Now only a single interactive row */}
      <MarqueeRow items={SVG_ASSETS} direction="left" speed="60s" />
    </div>
  );
}
