// Small reusable boxes for loading / error / empty / success states.
// type: 'loading' | 'error' | 'empty' | 'success' | 'warning'
export default function StatusMessage({ type, title, children }) {
  const isAlert = type === 'error' || type === 'warning';

  return (
    <div className={`status status-${type}`} role={isAlert ? 'alert' : 'status'}>
      {type === 'loading' && <span className="spinner" aria-hidden="true" />}
      <div>
        {title && <p className="status-title">{title}</p>}
        {children && <div className="status-body">{children}</div>}
      </div>
    </div>
  );
}
