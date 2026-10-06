export function Button({
 children,
 variant = 'default',
 size = 'default',
 className = '',
 disabled,
 ...props
}) {
 const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed';

 const variants = {
 default: 'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 border border-transparent',
 secondary: 'bg-card text-foreground border border-border hover:border-primary/50 hover:bg-accent',
 destructive: 'bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive/20',
 outline: 'bg-transparent border border-border text-foreground hover:border-primary/60 hover:bg-accent',
 ghost: 'text-muted-foreground hover:bg-accent hover:text-foreground',
 link: 'text-primary underline-offset-4 hover:underline',
 };

 const sizes = {
 default: 'h-10 px-4 py-2 text-sm',
 sm: 'h-9 px-3 text-xs',
 lg: 'h-11 px-6 text-base',
 icon: 'h-10 w-10',
 };

 return (
 <button
 className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
 disabled={disabled}
 {...props}
 >
 {children}
 </button>
 );
}