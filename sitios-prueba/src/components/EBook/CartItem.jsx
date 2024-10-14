import { useContext } from 'react';
import { formatCurrency } from '../../utils/currency';
import { CartContext } from '../../Pages/EBook/Home';

export const CartItem = ({ item }) => {
  const [cart, setCart] = useContext(CartContext);

  const handleDelete = () => {
    setCart(cart.filter((i) => i !== item));
  };

  return (
    <div className="flex justify-between gap-4 shadow p-4 items-start">
      <div className="w-24 h-32">
        <img src={item.img} className="max-h-full max-w-full" />
      </div>
      <p className="w-1/2">{item.title}</p>
      <p className="text-center text-fuchsia-500 font-bold text-lg">
        {formatCurrency(item.price)}
      </p>
      <button onClick={handleDelete}>
        <i className="fa-solid fa-xl fa-trash text-gray-600"></i>
      </button>
    </div>
  );
};
