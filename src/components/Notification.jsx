import { useApp } from '../context/AppContext';

export default function Notification() {
  const { notification } = useApp();
  if (!notification) return null;

  const styles = {
    success: { bg: '#fff', border: '1.5px solid var(--surface-3)', borderLeft: '4px solid var(--black)', color: 'var(--black)' },
    lime:    { bg: 'var(--lime)', border: '1.5px solid var(--lime-dark)', borderLeft: '4px solid var(--lime-dark)', color: 'var(--black)' },
    error:   { bg: '#fff', border: '1.5px solid #f3b3b3', borderLeft: '4px solid #e53e3e', color: '#c53030' },
    info:    { bg: '#fff', border: '1.5px solid var(--surface-3)', borderLeft: '4px solid var(--grey-light)', color: 'var(--grey)' },
  };

  const s = styles[notification.type] || styles.info;

  return (
    <div style={{ position: 'fixed', bottom: '1.25rem', right: '1.25rem', zIndex: 60, animation: 'fadeUp 0.3s ease both' }}>
      <div style={{ ...s, background: s.bg, padding: '0.875rem 1.25rem', borderRadius: 'var(--r-md)', boxShadow: 'var(--shadow-lg)', maxWidth: 320, fontFamily: 'Barlow', fontSize: '0.9rem', fontWeight: 600 }}>
        {notification.message}
      </div>
    </div>
  );
}
