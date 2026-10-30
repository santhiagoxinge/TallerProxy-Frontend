import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import type { ButtonHTMLAttributes, PointerEvent } from 'react'

const PULL = 0.28

/** Primary action that leans a few pixels toward the pointer and presses in on touch-down. */
export function MagneticButton({ children, className = '', ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  const reduce = useReducedMotion()
  const x = useSpring(useMotionValue(0), { stiffness: 260, damping: 20, mass: 0.5 })
  const y = useSpring(useMotionValue(0), { stiffness: 260, damping: 20, mass: 0.5 })

  const lean = (event: PointerEvent<HTMLButtonElement>) => {
    if (reduce || event.pointerType === 'touch' || rest.disabled) return
    const rect = event.currentTarget.getBoundingClientRect()
    x.set((event.clientX - (rect.left + rect.width / 2)) * PULL)
    y.set((event.clientY - (rect.top + rect.height / 2)) * PULL)
  }

  const settle = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.button
      type="button"
      className={`btn btn--primary ${className}`}
      style={{ x, y }}
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.12 }}
      onPointerMove={lean}
      onPointerLeave={settle}
      {...(rest as object)}
    >
      {children}
    </motion.button>
  )
}
