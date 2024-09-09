import { useTranslation } from 'react-i18next';

export const ProtectionItem = ({
  title,
  items,
  price,
  setProtection,
  protection,
  featured = false,
}) => {
  const changeProtection = () => {
    protection?.title !== title
      ? setProtection({ title, price })
      : setProtection(null);
  };

  const { t } = useTranslation();

  return (
    <div
      className={`relative p-2  m-4 hover:bg-gray-100 cursor-pointer${
        protection?.title === title ? ' border-2 border-blue-950' : ''
      }`}
      style={{ boxShadow: '0px 0px 20px rgb(0,0,0,0.2)' }}
      onClick={changeProtection}
    >
      {featured && (
        <div className="absolute right-0 top-0 p-2 bg-yellow-300">
          <p className="text-slate-800 text-lg font-medium">
            {t('Rental.Protection.Featured')}
          </p>
        </div>
      )}
      <h4 className="text-center text-lg font-bold">{title}</h4>
      <div className="my-4">
        {items.map((item, i) => (
          <p key={i} className="my-2">
            {item}
          </p>
        ))}
      </div>
      <div className="my-2">
        <p className="text-center text-xl font-bold text-slate-700">
          ${t('Rental.Protection.Price', { price })}
        </p>
      </div>
    </div>
  );
};
