import { useContext } from 'react';
import { CartContext } from '../../Pages/EBook/Home';
import { formatCurrency } from '../../utils/currency';

export const Book = ({ book, onItemAdd }) => {
  const [cart, setCart] = useContext(CartContext);

  const handleClick = () => {
    setCart([...cart, book]);
    onItemAdd(book);
  };

  return (
    <div className="w-64 my-6 border rounded border-gray-300 p-2">
      <div className="w-full h-64 mx-auto">
        <img
          src={book.img}
          className="max-h-full max-w-full"
          alt={book.title}
        />
      </div>
      <div className="my-4 flex flex-col gap-2">
        <h6 className="text-center">{book.title}</h6>
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
    </div>
  );
};
