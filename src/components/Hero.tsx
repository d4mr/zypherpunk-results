import { motion, animate, useMotionValue, useTransform } from "motion/react";
import { useEffect, useRef } from "react";

interface Props {
  totalProjects: number;
  totalAwards: number;
  totalUSD: number;
}

export function Hero({ totalProjects, totalAwards, totalUSD }: Props) {
  const statsRef = useRef<HTMLDivElement>(null);
  
  // Mouse tracking for parallax (desktop only)
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  
  const glowX = useTransform(mouseX, [0, 1], [-20, 20]);
  const glowY = useTransform(mouseY, [0, 1], [-20, 20]);

  useEffect(() => {
    // Animate the numbers counting up
    const counters = statsRef.current?.querySelectorAll("[data-value]");
    counters?.forEach((el) => {
      const target = parseInt(el.getAttribute("data-value") || "0", 10);
      animate(0, target, {
        duration: 2,
        delay: 0.8,
        ease: [0.16, 1, 0.3, 1],
        onUpdate: (value) => {
          el.textContent = Math.round(value).toLocaleString();
        },
      });
    });

    // Mouse move handler for parallax (skip on touch devices)
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX / window.innerWidth);
      mouseY.set(e.clientY / window.innerHeight);
    };

    if (window.matchMedia("(pointer: fine)").matches) {
      window.addEventListener("mousemove", handleMouseMove);
      return () => window.removeEventListener("mousemove", handleMouseMove);
    }
  }, [mouseX, mouseY]);

  return (
    <section className="relative overflow-hidden border-b border-gray-800">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-black/50 to-transparent" />
      
      {/* Interactive glow - hidden on mobile */}
      <motion.div
        className="pointer-events-none absolute hidden h-[400px] w-[400px] rounded-full bg-accent/10 blur-[100px] md:block"
        style={{
          x: glowX,
          y: glowY,
          left: "20%",
          top: "-10%",
        }}
      />
      
      {/* Secondary glow - hidden on mobile */}
      <motion.div
        className="pointer-events-none absolute hidden h-[250px] w-[250px] rounded-full bg-gold/10 blur-[80px] md:block"
        style={{
          x: useTransform(mouseX, [0, 1], [10, -10]),
          y: useTransform(mouseY, [0, 1], [10, -10]),
          right: "10%",
          bottom: "0%",
        }}
      />

      
      <div className="relative mx-auto max-w-7xl px-5 py-12 sm:px-6 sm:py-16 md:py-24 lg:py-32">
        <div className="max-w-3xl">
          {/* Date badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-4 inline-flex items-center gap-2 sm:mb-6"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            <span className="font-mono text-xs uppercase tracking-wider text-accent sm:text-sm">
              December 2025
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-4xl leading-[1.1] text-white sm:text-5xl md:text-7xl lg:text-8xl"
          >
            <span className="italic">Zypherpunk</span>
          </motion.h1>
          
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-4xl leading-[1.1] text-gray-500 sm:text-5xl md:text-7xl lg:text-8xl"
          >
            Winners
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="mt-5 max-w-xl text-base leading-relaxed text-gray-400 sm:mt-8 sm:text-lg"
          >
            Privacy-focused projects building the future of{" "}
            <span className="text-white">Zcash</span>. 
            From cross-chain bridges to zero-knowledge tooling.
          </motion.p>
        </div>

        {/* Stats */}
        <motion.div
          ref={statsRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-10 flex flex-wrap gap-x-8 gap-y-6 border-t border-gray-800 pt-6 sm:mt-14 sm:gap-x-12 sm:pt-8 md:gap-x-16"
        >
          <div>
            <div className="font-mono text-2xl font-bold text-white sm:text-3xl md:text-4xl">
              <span data-value={totalProjects}>0</span>
            </div>
            <div className="mt-1 text-xs text-gray-500 sm:text-sm">
              Projects
            </div>
          </div>
          
          <div>
            <div className="font-mono text-2xl font-bold text-white sm:text-3xl md:text-4xl">
              <span data-value={totalAwards}>0</span>
            </div>
            <div className="mt-1 text-xs text-gray-500 sm:text-sm">
              Awards
            </div>
          </div>
          
          <div>
            <div className="font-mono text-2xl font-bold text-gold sm:text-3xl md:text-4xl">
              $<span data-value={totalUSD}>0</span>
            </div>
            <div className="mt-1 text-xs text-gray-500 sm:text-sm">
              Distributed
            </div>
          </div>
        </motion.div>

        {/* Scroll indicator - desktop only */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 lg:block"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-2 text-gray-600"
          >
            <span className="text-xs uppercase tracking-widest">Scroll</span>
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 3v10m0 0l-4-4m4 4l4-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
