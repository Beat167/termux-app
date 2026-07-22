import Svg, { Circle, Path, Rect } from 'react-native-svg';

const common = { fill: 'none', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };

export function SearchIcon({ size = 20, color = '#111111' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...common} stroke={color}>
      <Circle cx="11" cy="11" r="7" />
      <Path d="M21 21l-4.3-4.3" />
    </Svg>
  );
}

export function FilterIcon({ size = 20, color = '#111111' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...common} stroke={color}>
      <Path d="M4 6h16M7 12h10M10 18h4" />
    </Svg>
  );
}

export function BellIcon({ size = 20, color = '#111111' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...common} stroke={color}>
      <Path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <Path d="M13.7 21a2 2 0 01-3.4 0" />
    </Svg>
  );
}

export function CartIcon({ size = 20, color = '#111111' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...common} stroke={color}>
      <Circle cx="9" cy="21" r="1" />
      <Circle cx="19" cy="21" r="1" />
      <Path d="M1 1h3l2.6 13.4a2 2 0 002 1.6h9.8a2 2 0 002-1.6L23 6H6" />
    </Svg>
  );
}

export function HeartIcon({ size = 20, color = '#111111', filled = false }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...common} stroke={color} fill={filled ? color : 'none'}>
      <Path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 10-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 000-7.8z" />
    </Svg>
  );
}

export function TechIcon({ size = 20, color = '#111111' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...common} stroke={color}>
      <Rect x="4" y="4" width="16" height="12" rx="1.5" />
      <Path d="M2 20h20M9 8h6M9 11h6" />
    </Svg>
  );
}

export function FashionIcon({ size = 20, color = '#111111' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...common} stroke={color}>
      <Path d="M8 4l4 2 4-2 4 4-3 3v11H7V11L4 8z" />
    </Svg>
  );
}

export function HomeIcon({ size = 20, color = '#111111' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...common} stroke={color}>
      <Path d="M3 11l9-7 9 7" />
      <Path d="M5 10v10h14V10" />
    </Svg>
  );
}

export function MotorIcon({ size = 20, color = '#111111' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...common} stroke={color}>
      <Circle cx="7" cy="17" r="2" />
      <Circle cx="17" cy="17" r="2" />
      <Path d="M5 17h-2v-4l2-5h9l3 5h2v4h-2M5 12h11" />
    </Svg>
  );
}

export function WellnessIcon({ size = 20, color = '#111111' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...common} stroke={color}>
      <Path d="M12 21s-7-4.5-9.3-9A5 5 0 0112 6a5 5 0 019.3 6c-2.3 4.5-9.3 9-9.3 9z" />
    </Svg>
  );
}
