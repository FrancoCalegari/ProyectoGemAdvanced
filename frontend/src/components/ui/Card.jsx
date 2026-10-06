export function Card({ children, className = '', hover = false, ...props }) {
  const base = 'bg-card border border-border rounded-2xl transition-all duration-200 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_8px_rgba(15,23,42,0.06)]';
  const hoverClass = hover
    ? 'hover:border-primary/60 hover:shadow-[0_4px_12px_rgba(37,99,235,0.15)] hover:-translate-y-0.5 cursor-pointer'
    : '';
  return (
    <div className={`${base} ${hoverClass} ${className}`} {...props}>
      {children}
    </div>
  );
}