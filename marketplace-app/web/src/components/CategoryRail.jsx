import { TechIcon, FashionIcon, HomeIcon, MotorIcon, WellnessIcon } from '../icons';

const CATEGORIES = [
  { key: 'tecnologia', label: 'Tecnología', Icon: TechIcon },
  { key: 'moda', label: 'Moda', Icon: FashionIcon },
  { key: 'hogar', label: 'Hogar', Icon: HomeIcon },
  { key: 'motor', label: 'Motor', Icon: MotorIcon },
  { key: 'bienestar', label: 'Bienestar', Icon: WellnessIcon },
];

export default function CategoryRail({ active, onSelect }) {
  return (
    <div className="category-rail">
      {CATEGORIES.map(({ key, label, Icon }) => (
        <button
          key={key}
          className={`category-item ${active === key ? 'active' : ''}`}
          onClick={() => onSelect(active === key ? '' : key)}
        >
          <span className="category-icon"><Icon /></span>
          <span className="category-label">{label}</span>
        </button>
      ))}
    </div>
  );
}
