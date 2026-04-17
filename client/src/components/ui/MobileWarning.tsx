export default function MobileWarning() {
    return (
        <div className="mobile-warning-overlay">
            <div className="mobile-warning-card">
                <img
                    src="/Logo Trello Clone.png"
                    alt="Trello Clone Logo"
                    className="h-12 w-auto object-contain mb-4 select-none"
                    draggable="false"
                />
                <p className="mobile-warning-text">
                    Este proyecto está hecho para escritorio. Para una experiencia
                    completa con drag & drop y todas las funciones, usa un computador.
                </p>
                <div className="mobile-warning-badge">
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>info</span>
                    El soporte móvil llegará pronto.
                </div>
            </div>
        </div>
    );
}
