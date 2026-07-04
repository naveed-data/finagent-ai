type CardProps = {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
};

function Card({ title, subtitle, children, className = "" }: CardProps) {
  return (
    <div
      className={`bg-neutral-900 border border-neutral-800 rounded-2xl shadow-sm p-6 ${className}`}
    >
      {(title || subtitle) && (
        <div className="mb-5">
          {title && (
            <h2 className="text-lg font-bold text-neutral-100">{title}</h2>
          )}
          {subtitle && (
            <p className="text-sm text-neutral-400 mt-1">{subtitle}</p>
          )}
        </div>
      )}

      {children}
    </div>
  );
}

export default Card;
