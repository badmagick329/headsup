import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'danger'

type Props = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant
    fullWidth?: boolean
  }
>

const baseClassName =
  'inline-flex min-h-14 items-center justify-center border px-5 py-3 text-base font-semibold uppercase tracking-[0.08em] transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-not-allowed disabled:opacity-50'

const variantClassNames: Record<ButtonVariant, string> = {
  primary: 'border-[#1f7a3d] bg-[#1f7a3d] text-white hover:bg-[#176030]',
  secondary: 'border-black bg-white text-black hover:bg-black hover:text-white',
  danger: 'border-black bg-black text-white hover:bg-[#1f7a3d] hover:border-[#1f7a3d]',
}

export function Button({
  children,
  className = '',
  variant = 'secondary',
  fullWidth = false,
  ...props
}: Props) {
  return (
    <button
      className={[
        baseClassName,
        variantClassNames[variant],
        fullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </button>
  )
}
