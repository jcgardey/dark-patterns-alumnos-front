export const Modal = ({ className = '', title, children, onClose }) => (
  <div className="w-full h-full top-0 left-0 fixed z-50 bg-gray-900/80">
    <div
      className={`mx-auto my-24 p-4 bg-white drop-shadow rounded w-4/5 overflow-auto ${className}`}
    >
      {!!onClose && (
        <div className="absolute top-1.5 right-1.5">
          <button onClick={onClose}>X</button>
        </div>
      )}
      <div>
        <h3 className="text-center text-2xl font-medium">{title}</h3>
      </div>
      <div className="mx-auto my-4">{children}</div>
    </div>
  </div>
);
