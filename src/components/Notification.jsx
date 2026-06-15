import { useApp } from '../context/AppContext';

export default function Notification() {
  const { notification } = useApp();
  if (!notification) return null;

  const styles = {
    success: 'border-l-4 border-ink-900 bg-white text-ink-900',
    lime: 'border-l-4 border-lime-500 bg-lime-500 text-ink-900',
    error: 'border-l-4 border-red-500 bg-white text-red-700',
    info: 'border-l-4 border-ink-400 bg-white text-ink-600',
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <div className={`px-5 py-3 shadow-xl max-w-xs font-sans text-sm font-semibold ${styles[notification.type] || styles.info}`}>
        {notification.message}
      </div>
    </div>
  );
}
