export function Brand() {
  return (
    <a
      className="brand"
      href="#inicio"
      aria-label="Enrutados Venezuela, volver al inicio"
      data-testid="link-brand"
    >
      <span className="brand-mark" aria-hidden="true">
        <span>e</span>
      </span>
      <span>
        Enrutados <span style={{ color: 'var(--violet)' }}>Venezuela</span>
      </span>
    </a>
  );
}
