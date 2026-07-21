export default function Reputation({ avgRating, reviewCount, size }) {
  if (!reviewCount) {
    return <span className="reputation" style={{ fontSize: size }}>Sin reseñas todavía</span>;
  }
  return (
    <span className="reputation" style={{ fontSize: size }}>
      <span className="star">★</span>
      <strong>{Number(avgRating).toFixed(1)}</strong>
      <span>({reviewCount} reseñas)</span>
    </span>
  );
}
