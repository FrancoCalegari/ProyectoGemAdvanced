import { X } from 'lucide-react';

export function Modal({ open, onClose, title, children, size = 'md' }) {
 if (!open) return null;

 const sizes = {
 sm: 'sm:max-w-md',
 md: 'sm:max-w-lg',
 lg: 'sm:max-w-2xl',
 xl: 'sm:max-w-4xl',
 };

 return (
 <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-background/70 ">
 <div className={`bg-background border border-border shadow-2xl shadow-primary/10 w-full ${sizes[size]} h-[95vh] sm:h-auto sm:max-h-[90vh] flex flex-col rounded-t-2xl sm:rounded-2xl`}>
 <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border">
 <h2 className="text-base sm:text-lg font-semibold text-foreground">{title}</h2>
 <button
 onClick={onClose}
 className="p-1 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
 aria-label="Cerrar"
 >
 <X className="w-5 h-5" />
 </button>
 </div>
 <div className="p-4 sm:p-6 overflow-y-auto flex-1">
 {children}
 </div>
 </div>
 </div>
 );
}