import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react'
import { useEffect } from 'react'

/**
 * Full-bleed frosted-glass photograph that the UI glass refracts. The image drifts a few pixels
 * against the pointer (parallax) and slowly breathes; both are disabled for reduced motion.
 */
export function Backdrop() {
  const reduce = useReducedMotion()
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const sx = useSpring(px, { stiffness: 50, damping: 20, mass: 1 })
  const sy = useSpring(py, { stiffness: 50, damping: 20, mass: 1 })
  const x = useTransform(sx, (v) => v * -22)
  const y = useTransform(sy, (v) => v * -22)

  useEffect(() => {
    if (reduce || !window.matchMedia('(pointer: fine)').matches) return
    const onMove = (event: PointerEvent) => {
      px.set((event.clientX / window.innerWidth) * 2 - 1)
      py.set((event.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [reduce, px, py])

  return (
    <div className="backdrop" aria-hidden="true">
      <motion.div className="backdrop__parallax" style={{ x, y }}>
        <div className="backdrop__image" />
      </motion.div>
      <div className="backdrop__veil" />
    </div>
  )
}
