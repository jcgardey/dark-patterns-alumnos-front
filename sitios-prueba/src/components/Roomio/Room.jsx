import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export const Room = ({ room, nights, adults }) => {
  const { t, i18n } = useTranslation();

  const onClick = () => {
    localStorage.setItem('hotel-price', room.price);
    localStorage.setItem('hotel-taxes', room.taxes);
  };

  const priceForStay = (Math.round(nights * room.price * 100) / 100).toFixed(2);
  const priceForStayWithTaxes = (
    Math.round(nights * (room.price + room.taxes) * 100) / 100
  ).toFixed(2);
  const taxesForStay = (Math.round(nights * room.taxes * 100) / 100).toFixed(2);
  const darkEnabled = localStorage.getItem('dark') == 'true' ?? false;

  return (
    <div className="mb-10 border border-gray-400 rounded">
      <div className="flex justify-between">
        <div className="w-1/4">
          <img src={room.img} className="img-fluid rounded-start" alt="..." />
        </div>

        <div className="w-1/2 pt-5">
          <a
            className="underline font-medium text-xl text-teal-600"
            dangerouslySetInnerHTML={{ __html: room.title }}
          />
          <div className="my-2">
            <p
              className="text-gray-800"
              dangerouslySetInnerHTML={{
                __html: room[`description_${i18n.language}`],
              }}
            />
            {room.freeCancellation && (
              <p className="font-bold text-md my-1">
                {t('Roomio.Results.Cancellation')}
              </p>
            )}
            <p className="my-1 text-gray-500">
              {t('Roomio.Results.Night', { count: nights })},{' '}
              {t('Roomio.Search.Adult', { count: parseInt(adults) })}
            </p>
          </div>
        </div>

        <div className="w-1/5 py-4">
          <h5 className="text-xs my-1 text-gray-900">
            {t('Roomio.Results.Night', { count: nights })}
          </h5>
          <h5 className="text-xl my-1 font-medium">
            $ {darkEnabled ? priceForStay : priceForStayWithTaxes}
          </h5>

          <p className="text-sm text-gray-500 my-2">
            {darkEnabled
              ? `+$ ${taxesForStay} ${t('Roomio.Results.Taxes')}`
              : t('Roomio.Results.TaxesIncluded')}
          </p>
          <Link
            to="/roomio/summary"
            onClick={onClick}
            className="bg-teal-600 text-xl hover:bg-teal-700 p-2 px-10 my-2 inline-block rounded text-white"
          >
            {t('Roomio.Results.Book')}
          </Link>
        </div>
      </div>
    </div>
  );
};
