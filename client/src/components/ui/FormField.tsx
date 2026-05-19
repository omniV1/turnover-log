import type { ReactNode } from 'react'
import { errorAlertClass, inputClass, labelClass } from '../../styles/forms'

interface FormFieldProps {
  id: string
  label: string
  children?: ReactNode
}

export function FormField({ id, label, children }: FormFieldProps) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      {children}
    </div>
  )
}

interface TextInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'id'> {
  id: string
  label: string
}

export function TextInput({ id, label, className, ...props }: TextInputProps) {
  return (
    <FormField id={id} label={label}>
      <input id={id} className={`${inputClass} ${className ?? ''}`} {...props} />
    </FormField>
  )
}

interface TextAreaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> {
  id: string
  label: string
}

export function TextArea({ id, label, className, ...props }: TextAreaProps) {
  return (
    <FormField id={id} label={label}>
      <textarea
        id={id}
        className={`${inputClass} ${className ?? ''}`}
        {...props}
      />
    </FormField>
  )
}

interface SelectFieldProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'id'> {
  id: string
  label: string
  children: ReactNode
}

export function SelectField({
  id,
  label,
  children,
  className,
  ...props
}: SelectFieldProps) {
  return (
    <FormField id={id} label={label}>
      <select id={id} className={`${inputClass} ${className ?? ''}`} {...props}>
        {children}
      </select>
    </FormField>
  )
}

export function FormError({ message }: { message: string }) {
  return <p className={errorAlertClass}>{message}</p>
}
