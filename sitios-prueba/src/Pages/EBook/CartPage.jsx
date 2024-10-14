import { useContext } from 'react';
import { CartContext } from './Home';
import { CartItem } from '../../components/EBook/CartItem';
import { Summary } from '../../components/EBook/Summary';
import { Link } from 'react-router-dom';

export const CartPage = () => {
  const [cart, _] = useContext(CartContext);

  return (
    <div className="m-4 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-600">Tu carrito</h1>
      {cart.length === 0 ? (
        <p>
          Actualmente no tiene ítems en el carrito{' '}
          <Link to={'/ebook'} className="text-fuchsia-400 underline">
            Seguir comprando
          </Link>
        </p>
      ) : (
        <div className="flex gap-4">
          <div className="w-2/3 flex flex-col gap-4 my-4">
            {cart.map((item, i) => (
              <CartItem key={i} item={item} />
            ))}
          </div>
          <Summary />
        </div>
      )}
    </div>
  );
};
