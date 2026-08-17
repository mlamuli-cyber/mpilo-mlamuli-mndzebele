export default function EmptyState({ icon: Icon, title, message }) {
  return (
    <div className="empty-state">
      {Icon && <Icon className="empty-state-icon" />}
      <h3>{title}</h3>
      {message && <p>{message}</p>}
    </div>
  );
}
