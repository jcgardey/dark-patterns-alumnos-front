import { formatCurrency } from '../../utils/currency';
import mastercard from '../../assets/EBook/mastercard.png';
import { useContext, useMemo } from 'react';
import { CartContext } from '../../Pages/EBook/Home';

export const Summary = () => {
  const [cart, setCart] = useContext(CartContext);

  const total = useMemo(() =>
    cart.reduce((total, item) => total + item.price, 0)
  );

  return (
    <div className="shadow p-4 w-1/3">
      <h3 className="text-xl text-center font-bold text-gray-600">Resumen</h3>
      <div className="mt-4 flex flex-col gap-8">
        <div>
          <p className="text-gray-600 font-bold text-md">Método de pago</p>
          <p className="text-gray-800 text-md">Tarjeta de crédito</p>
          <div className="my-1 flex gap-1 items-center">
            <img src={mastercard} className="w-10 h-10" />
            <p>terminada en 1234</p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-gray-600">
            <p>Subtotal</p>
            <p>{formatCurrency(total)}</p>
          </div>
          <div className="flex justify-between text-gray-600">
            <p>Costo de envío</p>
            <p>{formatCurrency(0)}</p>
          </div>
          <div className="flex justify-between text-gray-600">
            <p>Total</p>
            <p className="text-xl font-bold">{formatCurrency(total)}</p>
          </div>
        </div>
        <button className="bg-fuchsia-500 text-white rounded p-2 font-bold">
          Finalizar compra
        </button>
      </div>
    </div>
  );
};
