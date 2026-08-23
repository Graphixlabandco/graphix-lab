"use client";

import React, { useRef } from "react";
import { motion, useInView } from "motion/react";

interface SloMoRevealProps {
  text: string;
  delay?: number;
  className?: string;
}

export default function SloMoReveal({ text, delay = 0, className = "" }: SloMoRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10% 0px -10% 0px" });
  const words = text.split(" ");

  const container = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08,
        delayChildren: delay
      }
    }
  };

  const child = {
    hidden: { y: "115%", opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 1.25,
        ease: [0.16, 1, 0.3, 1] as const // Luxurious slow-motion cubic bezier
      }
    }
  };

  return (
    <motion.span
      ref={ref}
      variants={container}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={`inline-block overflow-hidden py-1.5 ${className}`}
    >
      {words.map((word, idx) => (
        <span key={idx} className="inline-block overflow-hidden mr-3 pb-1">
          <motion.span variants={child} className="inline-block">
            {word}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}
