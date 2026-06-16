import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, Search } from 'lucide-react';

export default function CustomDropdown({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  leadingIcon = null,
  searchable = true,
  width = '100%',
  size = 'md',
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [rect, setRect] = useState(null);
  const btnRef = useRef(null);
  const panelRef = useRef(null);
  const inputRef = useRef(null);

  const norm = options.map(o => typeof o === 'string' ? { value: o, label: o || '— No pick —' } : o);
  const filtered = query
    ? norm.filter(o => (o.label || '').toLowerCase().includes(query.toLowerCase()))
    : norm;

  function updatePos() {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    setRect({ top: r.bottom + 6, left: r.left, width: r.width });
  }

  useLayoutEffect(() => { if (open) updatePos(); }, [open]);

  useEffect(() => {
    if (!open) { setQuery(''); return; }
    if (searchable) setTimeout(() => inputRef.current?.focus(), 30);

    function onClick(e) {
      if (btnRef.current?.contains(e.target)) return;
      if (panelRef.current?.contains(e.target)) return;
      setOpen(false);
    }
    function onKey(e) { if (e.key === 'Escape') setOpen(false); }
    function onScroll() { updatePos(); }

    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
  }, [open, searchable]);

  const padY = size === 'sm' ? '0.45rem' : '0.6rem';
  const fontSize = size === 'sm' ? '0.84rem' : '0.9rem';

  return (
    <div style={{ position: 'relative', width }}>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%',
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--white, #fff)',
          border: `1.5px solid ${open ? 'var(--ink, #14201A)' : 'var(--chalk, #E7E9DF)'}`,
          borderRadius: 8,
          padding: `${padY} 0.85rem`,
          fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize,
          color: 'var(--ink, #14201A)',
          cursor: 'pointer', textAlign: 'left',
          transition: 'border-color 0.15s, box-shadow 0.15s',
          boxShadow: open ? '0 0 0 3px rgba(155,202,53,0.18)' : 'none',
        }}
      >
        {leadingIcon}
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: value ? 'inherit' : 'var(--grey-light, #9CA39A)' }}>
          {value || placeholder}
        </span>
        <ChevronDown size={14} strokeWidth={2.4} style={{
          color: 'var(--grey, #66705F)',
          transition: 'transform 0.2s',
          transform: open ? 'rotate(180deg)' : 'rotate(0)',
          flexShrink: 0,
        }} />
      </button>

      {open && rect && createPortal(
        <div
          ref={panelRef}
          style={{
            position: 'fixed',
            top: rect.top, left: rect.left,
            width: Math.max(rect.width, 240),
            background: '#ffffff',
            border: '1.5px solid var(--chalk, #E7E9DF)',
            borderRadius: 10,
            boxShadow: '0 20px 60px rgba(20,32,26,0.25)',
            zIndex: 99999,
            overflow: 'hidden',
            animation: 'dd-pop 0.16s cubic-bezier(0.18, 0.89, 0.32, 1.28) both',
          }}
        >
          {searchable && norm.length > 6 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '0.6rem 0.75rem',
              borderBottom: '1px solid var(--chalk, #E7E9DF)',
              background: 'var(--surface, #F6F7F1)',
            }}>
              <Search size={13} color="var(--grey-light, #9CA39A)" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search…"
                style={{
                  flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  fontFamily: 'Inter', fontWeight: 500, fontSize: '0.85rem',
                  color: 'var(--ink, #14201A)',
                }}
              />
            </div>
          )}
          <div style={{ maxHeight: 280, overflowY: 'auto', background: '#fff' }}>
            {filtered.length === 0 && (
              <div style={{ padding: '0.8rem 0.9rem', fontFamily: 'Inter', fontSize: '0.85rem', color: 'var(--grey-light, #9CA39A)' }}>
                No matches.
              </div>
            )}
            {filtered.map(o => {
              const selected = o.value === value;
              return (
                <button
                  key={o.value || '__none__'}
                  type="button"
                  onClick={() => { onChange(o.value); setOpen(false); }}
                  style={{
                    width: '100%',
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '0.55rem 0.85rem',
                    border: 'none',
                    background: selected ? 'var(--lime-faint, #EDF7CF)' : '#fff',
                    fontFamily: 'Inter', fontWeight: selected ? 700 : 500, fontSize: '0.88rem',
                    color: o.value ? 'var(--ink, #14201A)' : 'var(--grey-light, #9CA39A)',
                    cursor: 'pointer', textAlign: 'left',
                  }}
                  onMouseEnter={e => { if (!selected) e.currentTarget.style.background = 'var(--surface, #F6F7F1)'; }}
                  onMouseLeave={e => { if (!selected) e.currentTarget.style.background = '#fff'; }}
                >
                  {o.leading}
                  <span style={{ flex: 1 }}>{o.label}</span>
                  {selected && <Check size={13} strokeWidth={3} color="var(--turf-deep, #4F6E1B)" />}
                </button>
              );
            })}
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
