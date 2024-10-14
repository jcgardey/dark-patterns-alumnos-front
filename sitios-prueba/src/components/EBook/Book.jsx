import { useContext } from 'react';
import { CartContext } from '../../Pages/EBook/Home';
import { formatCurrency } from '../../utils/currency';

export const Book = ({ book, onItemAdd }) => {
  const [cart, setCart] = useContext(CartContext);

  const isDark = localStorage.getItem('dark') === 'true';

  const handleClick = () => {
    setCart([...cart, book]);
    onItemAdd(book);
  };

  return (
    <div className="w-64 my-6 border rounded border-gray-300 p-2 relative">
      <div className="w-full h-64">
        <img
          src={book.img}
          className="max-h-full max-w-full mx-auto"
          alt={book.title}
        />
      </div>
      <div className="mt-4 mb-8 flex flex-col gap-4">
        <h6 className="text-center truncate">{book.title}</h6>
        <p className="text-center text-fuchsia-500 font-bold text-xl">
          {formatCurrency(book.price)}
        </p>
        <button
          onClick={handleClick}
          className="border rounded border-gray-500 p-1 text-gray-600 font-bold hover:text-gray-400 hover:border-gray-400"
        >
          Agregar al carrito
        </button>
      </div>
      {book.last && isDark && (
        <p className="absolute bottom-1 left-14 text-red-500 font-bold text-lg">
          Últimas unidades!
        </p>
      )}
    </div>
  );
};
