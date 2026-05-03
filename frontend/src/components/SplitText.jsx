import React, { useState } from "react";

/**
 * AnimatedChar
 * A single character that tracks its own hover state.
 */
function AnimatedChar({ char, index, animationType, charClassName }) {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setTimeout(() => setIsHovered(false), 400);
  };

  const getAnimationClass = () => {
    if (!isHovered) return "";
    return animationType === "tumble" ? "animate-tumble" : "animate-wavy";
  };

  return (
    <span
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`${charClassName} ${getAnimationClass()}`}
      style={{
        display: "inline-block",
        whiteSpace: char === " " ? "pre" : "normal",
        "--char-index": index,
        transition: "transform 0.3s ease",
        cursor: "default"
      }}
    >
      {char}
    </span>
  );
}

/**
 * SplitText
 * Enhanced to group characters into words to prevent awkward line breaks.
 */
export default function SplitText({ text, animationType = "tumble", charClassName = "" }) {
  const words = text.split(" ");
  let globalIndex = 0;

  return (
    <span style={{ display: "inline-block" }}>
      {words.map((word, wordIndex) => (
        <span 
          key={wordIndex} 
          style={{ display: "inline-block", whiteSpace: "nowrap" }}
        >
          {word.split("").map((char) => {
            const index = globalIndex++;
            return (
              <AnimatedChar 
                key={index} 
                char={char} 
                index={index} 
                animationType={animationType} 
                charClassName={charClassName} 
              />
            );
          })}
          {/* Add space after word if not the last word */}
          {wordIndex < words.length - 1 && (
            <AnimatedChar 
              key={`space-${wordIndex}`} 
              char=" " 
              index={globalIndex++} 
              animationType={animationType} 
              charClassName={charClassName} 
            />
          )}
        </span>
      ))}
    </span>
  );
}
