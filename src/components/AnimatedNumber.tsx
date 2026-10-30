import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { useEffect } from 'react'

interface AnimatedNumberProps {
  value: number
  decimals?: number
  suffix?: string
}

/** Counts from the previous value to the next with a critically damped spring. */
export function AnimatedNumber({ value, decimals = 0, suffix = '' }: AnimatedNumberProps) {
  const source = useMotionValue(0)
  const spring = useSpring(source, { stiffness: 110, damping: 21, mass: 1 })
  const text = useTransform(spring, (v) => `${v.toFixed(decimals)}${suffix}`)

  useEffect(() => {
    source.set(value)
  }, [value, source])

  return <motion.span>{text}</motion.span>
}
