export function Badge({ children, variant = 'default', className = '' }) {
 const variants = {
 default: 'bg-primary/15 border border-primary/30 text-primary',
 secondary: 'bg-card border border-border text-foreground',
 destructive: 'bg-destructive/10 border border-destructive/30 text-destructive',
 outline: 'bg-transparent border border-border text-foreground',
 success: 'bg-success/10 border border-success/30 text-success',
 warning: 'bg-warning/10 border border-warning/30 text-warning',
 info: 'bg-secondary/10 border border-secondary/30 text-secondary',
 muted: 'bg-card border border-border/50 text-muted-foreground',
 };

 return (
 <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${variants[variant] || variants.default} ${className}`}>
 {children}
 </span>
 );
}