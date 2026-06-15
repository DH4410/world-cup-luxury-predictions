import { useApp } from '../context/AppContext';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export default function Notification() {
  const { notification } = useApp();
  if (!notification) return null;

  const styles = {
    success: { bg: 'bg-white border-charcoal-900', icon: <CheckCircle size={14} strokeWidth={1.5} className="text-charcoal-800" /> },
    gold: { bg: 'bg-white border-gold-500', icon: <CheckCircle size={14} strokeWidth={1.5} className="text-gold-500" /> },
    error: { bg: 'bg-white border-red-400', icon: <AlertCircle size={14} strokeWidth={1.5} className="text-red-400" /> },
    info: { bg: 'bg-white border-charcoal-400', icon: <Info size={14} strokeWidth={1.5} className="text-charcoal-400" /> },
  };

  const s = styles[notification.type] || styles.info;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-pulse-once">
      <div className={`flex items-center gap-3 px-5 py-3.5 border-l-2 shadow-lg ${s.bg} max-w-sm`}>
        {s.icon}
        <p className="font-sans text-xs text-charcoal-800 leading-relaxed">{notification.message}</p>
      </div>
    </div>
  );
}
