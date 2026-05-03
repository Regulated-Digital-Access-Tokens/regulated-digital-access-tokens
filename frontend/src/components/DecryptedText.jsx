import { useState, useRef, useEffect } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+-*.:/";

function DecryptedChar({ originalChar, scrambleColor = "var(--color-slate)" }) {
  const [displayChar, setDisplayChar] = useState(originalChar);
  const [isScrambling, setIsScrambling] = useState(false);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  const startScrambling = () => {
    if (originalChar === " ") return;
    
    setIsScrambling(true);
    clearInterval(intervalRef.current);
    clearTimeout(timeoutRef.current);

    intervalRef.current = setInterval(() => {
      setDisplayChar(CHARS[Math.floor(Math.random() * CHARS.length)]);
    }, 50);
  };

  const stopScrambling = () => {
    if (originalChar === " ") return;

    // Continue scrambling briefly when mouse leaves
    timeoutRef.current = setTimeout(() => {
      clearInterval(intervalRef.current);
      setDisplayChar(originalChar);
      setIsScrambling(false);
    }, 300);
  };

  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <span
      onMouseEnter={startScrambling}
      onMouseLeave={stopScrambling}
      style={{
          display: "inline-block",
          position: "relative",
          color: isScrambling ? scrambleColor : "inherit",
          transition: "color 0.2s ease",
          cursor: "default"
        }}
    >
      {/* Invisible original character maintains exact original width */}
      <span style={{ visibility: "hidden" }}>
        {originalChar === " " ? "\u00A0" : originalChar}
      </span>
      {/* Absolute positioned visible character */}
      <span style={{ position: "absolute", left: "50%", top: 0, transform: "translateX(-50%)" }}>
        {displayChar === " " ? "\u00A0" : displayChar}
      </span>
    </span>
  );
}

export default function DecryptedText({ text, className, style, scrambleColor }) {
  return (
    <h1
      className={className}
      style={{ ...style, whiteSpace: "nowrap" }}
    >
      {text.split("").map((char, i) => (
        <DecryptedChar key={i} originalChar={char} scrambleColor={scrambleColor} />
      ))}
    </h1>
  );
}
