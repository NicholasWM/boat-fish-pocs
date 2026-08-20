import { InputHTMLAttributes } from 'react'

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Checkbox({ label, error, className = '', ...props }: CheckboxProps) {
  return (
    <div className="space-y-1">
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
          {...props}
        />
        <span className="text-sm text-slate-700">{label}</span>
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
