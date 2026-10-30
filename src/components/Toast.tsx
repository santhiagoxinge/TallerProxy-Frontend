import { AnimatePresence, motion } from 'motion/react'
import { useEffect } from 'react'
import { text } from '../labels'
import { EASE_OUT } from '../motion'
import { AlertIcon, CheckIcon, CloseIcon } from './Icons'

export interface ToastMessage {
  id: number
  kind: 'success' | 'error'
  message: string
}

interface ToastProps {
  toast: ToastMessage | null
  onDismiss: () => void
}

const DISMISS_AFTER_MS = 4500

/** Glass notice that materializes from the bottom edge and leaves the way it came. */
export function Toast({ toast, onDismiss }: ToastProps) {
  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(onDismiss, DISMISS_AFTER_MS)
    return () => window.clearTimeout(timer)
  }, [toast, onDismiss])

  return (
    <div className="toast-region" role="status" aria-live="polite">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            className={`toast glass-solid toast--${toast.kind}`}
            initial={{ opacity: 0, transform: 'translateY(18px) scale(0.96)', filter: 'blur(6px)' }}
            animate={{ opacity: 1, transform: 'translateY(0px) scale(1)', filter: 'blur(0px)' }}
            exit={{ opacity: 0, transform: 'translateY(18px) scale(0.96)', filter: 'blur(6px)' }}
            transition={{ duration: 0.28, ease: EASE_OUT }}
          >
            {toast.kind === 'success' ? <CheckIcon /> : <AlertIcon />}
            <span>{toast.message}</span>
            <button type="button" className="icon-btn icon-btn--small" onClick={onDismiss} aria-label={text.dismiss}>
              <CloseIcon />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
