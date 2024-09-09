import { Link } from 'react-router-dom';

export const PageTitle = ({ children }) => (
  <p className="font-bold my-4 p-2 text-lg text-gray-500 border-b border-gray-500">
    {children}
  </p>
);

export const PrimaryButton = ({
  children,
  className = '',
  type,
  disabled = false,
  onClick,
}) => (
  <button
    className={`text-white bg-green-600 hover:bg-green-700 rounded w-full p-2 ${className}`}
    type={type}
    disabled={disabled}
  >
    {children}
  </button>
);

export const BackButton = ({ children, to, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className="text-white text-center block bg-gray-700 hover:grey-800 rounded w-full p-2"
  >
    {children}
  </Link>
);
