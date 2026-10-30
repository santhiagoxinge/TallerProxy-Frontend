import { motion } from 'motion/react'
import { useId } from 'react'

interface Option<T extends string> {
  value: T
  label: string
}

interface SegmentedControlProps<T extends string> {
  label: string
  value: T
  options: Option<T>[]
  onChange: (value: T) => void
}

/** Radio group with a glass pill that slides between options. Native radios keep keyboard support. */
export function SegmentedControl<T extends string>({ label, value, options, onChange }: SegmentedControlProps<T>) {
  const name = useId()

  return (
    <fieldset className="segmented">
      <legend>{label}</legend>
      <div className="segmented__track">
        {options.map((option) => {
          const active = option.value === value
          return (
            <label key={option.value} className={active ? 'is-active' : ''}>
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={active}
                onChange={() => onChange(option.value)}
              />
              {active && (
                <motion.span
                  layoutId={`pill-${name}`}
                  className="segmented__pill"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
              <span className="segmented__label">{option.label}</span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
