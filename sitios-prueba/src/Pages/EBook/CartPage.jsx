import { useContext } from 'react';
import { CartContext } from './Home';
import { CartItem } from '../../components/EBook/CartItem';
import { Summary } from '../../components/EBook/Summary';

export const CartPage = () => {
  const [cart, _] = useContext(CartContext);

  return (
    <div className="m-4">
      <h1 className="text-2xl font-bold text-gray-600">Tu carrito</h1>
      <div className="flex gap-4">
        <div className="w-2/3 flex flex-col gap-4 my-4">
          {cart.map((item, i) => (
            <CartItem key={i} item={item} />
          ))}
        </div>
        <Summary />
      </div>
    </div>
  );
};
