import { useEffect, useState } from 'react';
import { differenceInDays } from '../../utils/date';
import { ProtectionItem } from '../../components/CarRent/ProtectionItem';
import { ProtectionModal } from '../../components/CarRent/ProtectionModal';
import { Link, useNavigate } from 'react-router-dom';
import { OrderItem } from '../../components/CarRent/OrderItem';
import { TotalPrice } from '../../components/CarRent/TotalPrice';
import { BackIcon } from '../../components/Icons/BackIcon';
import { useTranslation } from 'react-i18next';

export const SelectProtection = () => {
  const reservation = JSON.parse(localStorage.getItem('reservation'));

  const [protection, setProtection] = useState(reservation.protection || null);

  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    document.title = t('Rental.Protection.Select');
  }, []);

  const totalPrice = () =>
    differenceInDays(
      new Date(reservation.endDate),
      new Date(reservation.startDate)
    ) *
    (reservation.vehicle.price + (protection?.price || 0));

  const onNext = () => {
    const dark = localStorage.getItem('dark');
    dark === 'true' &&
    (protection === null ||
      protection.title === t('Rental.Protection.Basic.Name'))
      ? setShowModal(true)
      : checkout();
  };

  const checkout = () => {
    reservation.protection = protection;
    reservation.total = totalPrice().toFixed(2);
    localStorage.setItem('reservation', JSON.stringify(reservation));
    navigate('/car_rental/review');
  };

  const { t } = useTranslation();

  return (
    <div className="w-4/5 mx-auto py-4">
      <div className="flex items-center">
        <Link to="/car_rental/vehicle">
          <BackIcon />
        </Link>
        <h2 className="text-2xl text-black font-semibold">
          {t('Rental.Protection.Select')}
        </h2>
      </div>

      <div className="flex justify-between">
        <div className="my-4 w-1/2">
          <ProtectionItem
            title={t('Rental.Protection.Basic.Name')}
            protection={protection}
            setProtection={setProtection}
            items={[t('Rental.Protection.Basic.Description')]}
            price={9.99}
          />

          <ProtectionItem
            title={t('Rental.Protection.Standard.Name')}
            protection={protection}
            setProtection={setProtection}
            items={[
              t('Rental.Protection.Basic.Description'),
              t('Rental.Protection.Standard.Description'),
            ]}
            price={29.99}
          />

          <ProtectionItem
            title={t('Rental.Protection.Total.Name')}
            protection={protection}
            setProtection={setProtection}
            items={[
              t('Rental.Protection.Basic.Description'),
              t('Rental.Protection.Standard.Description'),
              t('Rental.Protection.Total.Description'),
            ]}
            price={59.99}
            featured={true}
          />
        </div>
        <div className="w-1/4">
          <div className="shadow p-2">
            <div className="border-b p-1 my-2">
              <h4 className="text-center font-medium text-xl">
                {reservation.vehicle.name}
              </h4>
              <p className="my-1 italic text-md">
                {reservation.vehicle.description}
              </p>
            </div>
            <div className="border-b p-1 my-2">
              <OrderItem description={t('Rental.Review.Order.Unlimited')} />
              <OrderItem description={t('Rental.Review.Order.Tires')} />
              <OrderItem description={t('Rental.Review.Order.Rental')} />
              <OrderItem description={t('Rental.Review.Order.License')} />
              {protection !== null && (
                <OrderItem description={protection.title} />
              )}
            </div>
            <TotalPrice price={totalPrice().toFixed(2)} />
            <button
              className="w-full bg-slate-800 text-white p-2"
              onClick={onNext}
            >
              {t('Rental.Protection.Next')}
            </button>
            {showModal && (
              <ProtectionModal
                onClose={() => setShowModal(false)}
                onNext={checkout}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
