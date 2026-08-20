import { forwardRef, type SelectHTMLAttributes } from 'react'

interface SelectProps<T extends string> extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: T; label: string }[]
}

export function Select<T extends string>({ label, error, options, className = '', ...props }: SelectProps<T>) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
          error ? 'border-red-500' : 'border-slate-300'
        } ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
