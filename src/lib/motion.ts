/**
 * ShopSense Unified Motion Design System
 * Standardized easing, durations, and animation variants built on Framer Motion.
 * Respects 'prefers-reduced-motion'.
 */

export const TRANSITION_EASE = [0.22, 1, 0.36, 1] as const; // Fluid cubic-bezier
export const TRANSITION_FAST = 0.2;
export const TRANSITION_NORMAL = 0.4;
export const TRANSITION_SLOW = 0.65;

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: TRANSITION_NORMAL, ease: TRANSITION_EASE },
  },
};

export const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: TRANSITION_NORMAL, ease: TRANSITION_EASE },
  },
};

export const heroHeadline = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: i * 0.08,
      ease: TRANSITION_EASE,
    },
  }),
};

export const staggerContainer = (staggerChildren = 0.08, delayChildren = 0) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren,
      delayChildren,
    },
  },
});

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: TRANSITION_NORMAL, ease: TRANSITION_EASE },
  },
};

export const modalVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.25, ease: TRANSITION_EASE },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: 4,
    transition: { duration: 0.18, ease: "easeIn" },
  },
};

export const cardHover = {
  rest: { y: 0, scale: 1, transition: { duration: 0.2, ease: "easeOut" } },
  hover: { y: -4, scale: 1.01, transition: { duration: 0.2, ease: "easeOut" } },
};
