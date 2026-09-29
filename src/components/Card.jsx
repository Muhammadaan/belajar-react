export default function Card({ title, value, subtitle }) {
  return (
    <div className="card">
      {title && <p className="card-title">{title}</p>}
      {value !== undefined && <h3 className="card-value">{value}</h3>}
      {subtitle && <p className="card-sub">{subtitle}</p>}
    </div>
  );
}
