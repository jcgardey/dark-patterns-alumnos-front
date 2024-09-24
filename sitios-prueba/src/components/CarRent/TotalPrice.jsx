export const TotalPrice = ({ price }) => (
  <div className="mx-2 my-4 flex justify-between font-bold text-lg">
    <p>Total</p>
    <p className="font-bold text-slate-700">${price}</p>
  </div>
);
