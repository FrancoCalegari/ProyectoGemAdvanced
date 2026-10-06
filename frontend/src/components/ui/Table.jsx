export function Table({ children, className = '' }) {
 return (
 <div className={`overflow-x-auto ${className}`}>
 <table className="w-full text-sm">{children}</table>
 </div>
 );
}

export function TableHeader({ children }) {
 return (
 <thead className="bg-card text-xs text-muted-foreground uppercase tracking-wider border-b border-border">
 {children}
 </thead>
 );
}

export function TableBody({ children }) {
 return <tbody className="divide-y divide-border">{children}</tbody>;
}

export function TableRow({ children, className = '' }) {
 return <tr className={`hover:bg-accent/50 transition-colors ${className}`}>{children}</tr>;
}

export function TableHead({ children, className = '' }) {
 return <th className={`text-left px-4 py-3 font-semibold ${className}`}>{children}</th>;
}

export function TableCell({ children, className = '' }) {
 return <td className={`px-4 py-3 text-foreground/90 ${className}`}>{children}</td>;
}