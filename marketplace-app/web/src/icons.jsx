const base = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };

export function SearchIcon() {
  return (
    <svg {...base}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  );
}

export function FilterIcon() {
  return (
    <svg {...base}>
      <path d="M4 6h16M7 12h10M10 18h4" />
    </svg>
  );
}

export function BellIcon() {
  return (
    <svg {...base}>
      <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 01-3.4 0" />
    </svg>
  );
}

export function CartIcon() {
  return (
    <svg {...base}>
      <circle cx="9" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M1 1h3l2.6 13.4a2 2 0 002 1.6h9.8a2 2 0 002-1.6L23 6H6" />
    </svg>
  );
}

export function HeartIcon({ filled }) {
  return (
    <svg {...base} fill={filled ? 'currentColor' : 'none'}>
      <path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 10-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 000-7.8z" />
    </svg>
  );
}

export function TechIcon() {
  return (
    <svg {...base}>
      <rect x="4" y="4" width="16" height="12" rx="1.5" />
      <path d="M2 20h20M9 8h6M9 11h6" />
    </svg>
  );
}

export function FashionIcon() {
  return (
    <svg {...base}>
      <path d="M8 4l4 2 4-2 4 4-3 3v11H7V11L4 8z" />
    </svg>
  );
}

export function HomeIcon() {
  return (
    <svg {...base}>
      <path d="M3 11l9-7 9 7" />
      <path d="M5 10v10h14V10" />
    </svg>
  );
}

export function MotorIcon() {
  return (
    <svg {...base}>
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
      <path d="M5 17h-2v-4l2-5h9l3 5h2v4h-2M5 12h11" />
    </svg>
  );
}

export function WellnessIcon() {
  return (
    <svg {...base}>
      <path d="M12 21s-7-4.5-9.3-9A5 5 0 0112 6a5 5 0 019.3 6c-2.3 4.5-9.3 9-9.3 9z" />
    </svg>
  );
}
