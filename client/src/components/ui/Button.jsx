/**
 * Shared Quilio button — design-system primitive.
 * variant: primary | ghost | danger | soft
 */
export default function Button({
  children,
  variant = 'primary',
  type = 'button',
  className = '',
  disabled,
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`q-btn q-btn-${variant} ${className}`.trim()}
      {...rest}
    >
      {children}
    </button>
  );
}
