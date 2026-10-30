/** Shared motion tokens. Curves follow the strong ease-out used across the interface. */
export const EASE_OUT = [0.23, 1, 0.32, 1] as const

export const SPRING_SOFT = { type: 'spring', stiffness: 220, damping: 26, mass: 1 } as const
export const SPRING_TILT = { stiffness: 180, damping: 22, mass: 0.6 } as const

/** Materialize: a glass surface arrives sharpening and settling, not just fading in. */
export const materialize = {
  hidden: { opacity: 0, transform: 'translateY(14px) scale(0.985)', filter: 'blur(8px)' },
  show: {
    opacity: 1,
    transform: 'translateY(0px) scale(1)',
    filter: 'blur(0px)',
    transition: { duration: 0.46, ease: EASE_OUT },
  },
}

export const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
}
