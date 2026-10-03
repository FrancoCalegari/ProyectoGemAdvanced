import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function BackButton({ label = 'Volver', to = null }) {
 const navigate = useNavigate();

 const handleClick = () => {
 if (to) {
 navigate(to);
 } else {
 navigate(-1);
 }
 };

 return (
 <button
 onClick={handleClick}
 className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-card border border-transparent hover:border-border transition-all"
 >
 <ArrowLeft className="w-4 h-4" />
 {label}
 </button>
 );
}