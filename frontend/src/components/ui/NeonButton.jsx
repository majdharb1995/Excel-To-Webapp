export default function NeonButton({ variant = 'blue', size = '', disabled = false, children, className = '', ...props }) {
  const classes = `neon-btn ${variant}${size ? ` ${size}` : ''}${className ? ` ${className}` : ''}`;
  return (
    <button className={classes} disabled={disabled} {...props}>
      {children}
    </button>
  );
}
