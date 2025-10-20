import { forwardRef, useEffect, useMemo, useState } from 'react';
import { NavBar } from '../../components/Roomio/NavBar';
import { Footer } from '../../components/Roomio/Footer';
import { useForm } from 'react-hook-form';
import { formatCurrency } from '../../utils/currency';
import { useTranslation } from 'react-i18next';
import { FinishedTask } from '../../components/FinishedTask';

const Input = forwardRef(
  ({ id, type = 'text', placeholder, errors, ...props }, ref) => (
    <input
      id={id}
      ref={ref}
      type={type}
      className={`w-full rounded block p-2${!!errors ? ' border-2 border-red-500' : ''}`}
      placeholder={placeholder}
      {...props}
    />
  )
);

const FieldError = ({ message }) => <p className="text-red-600 my-1">{message}</p>;

// ---- Utilidad para formatear HH:MM:SS
const formatRemaining = (ms) => {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(totalSec / 3600)).padStart(2, '0');
  const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
  const s = String(totalSec % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
};

// ---- Hook: crea un deadline aleatorio [1..7] h y cuenta hacia atrás
const useFlashSaleTimer = (minH = 1, maxH = 7) => {
  const deadline = useMemo(() => {
    const hours = Math.floor(Math.random() * (maxH - minH + 1)) + minH;
    return Date.now() + hours * 60 * 60 * 1000;
  }, [minH, maxH]);

  const [remainingMs, setRemainingMs] = useState(() => deadline - Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      const left = deadline - Date.now();
      setRemainingMs(left > 0 ? left : 0);
    }, 1000);
    return () => clearInterval(id);
  }, [deadline]);

  return remainingMs;
};

// ---- Etiqueta reutilizable
const FlashSaleBadge = ({ remainingMs }) => (
  <span className="flex items-center gap-2 ml-2">
    <span className="inline-flex items-center rounded bg-yellow-300 text-black text-xs font-semibold px-2 py-0.5">
      Flash sale
    </span>
    <span className="text-xs tabular-nums">{formatRemaining(remainingMs)}</span>
  </span>
);

export const RoomioSummary = () => {
  const [showAutocompleteCard, setShowAutocompleteCard] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  // Timers independientes
  const priceRemaining = useFlashSaleTimer(); // 1..7 h random
  const taxesRemaining = useFlashSaleTimer();
  const totalRemaining = useFlashSaleTimer();

  const {
    handleSubmit,
    register,
    setValue,
    getValues,
    formState: { errors },
  } = useForm();

  const onSubmit = () => setConfirmed(true);

  const autocompleteCard = () => {
    setShowAutocompleteCard(false);
    setValue('x-number', '5490 4234 4899 4324');
    setValue('x-name', getValues('fullName') || 'Miriam Flores');
    setValue('x-expiry', '12/28');
    setValue('x-code', '322');
  };

  const nights = parseInt(localStorage.getItem('hotel-nights')) ?? 0;
  const price = (parseFloat(localStorage.getItem('hotel-price')) ?? 0) * nights;
  const taxes = (parseFloat(localStorage.getItem('hotel-taxes')) ?? 0) * nights;

  const { t } = useTranslation();

  const data = {
    nights,
    price,
    taxes,
    city: localStorage.getItem('hotel-city'),
  };

  return (
    <>
      <NavBar />
      <div className="w-10/12 mx-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="hotel_checkout">
          <div className="flex justify-between my-10">
            <div className="w-4/6">
              <div className="bg-neutral-200 p-6 rounded">
                <div className="w-1/3">
                  <div className="my-4">
                    <label htmlFor="fullName">{t('Roomio.Summary.Name')}</label>
                    <Input
                      id="fullName"
                      placeholder="Andrea Paz"
                      {...register('fullName', { required: true })}
                      errors={errors.fullName}
                    />
                  </div>

                  <div className="my-4">
                    <label htmlFor="email">E-mail</label>
                    <Input
                      id="email"
                      placeholder="andrea.paz@mail.com"
                      {...register('email', { required: true })}
                      errors={errors.email}
                    />
                    {errors.email && <FieldError message={'Ingrese un email válido'} />}
                  </div>
                </div>
              </div>

              <div className="bg-neutral-200 my-4 p-6 rounded">
                <div className="flex my-4">
                  <div className="w-1/3 mr-8 relative">
                    <p
                      dangerouslySetInnerHTML={{
                        __html: t('Rental.Review.Payment.Card.Number'),
                      }}
                    />
                    <Input
                      type="text"
                      placeholder="XXXX XXXX XXXX XXXX"
                      onFocus={() => setShowAutocompleteCard(true)}
                      onBlur={() => setShowAutocompleteCard(false)}
                      {...register('x-number', { required: true })}
                      errors={errors['x-number']}
                    />
                    {showAutocompleteCard && (
                      <div id="autocompleteCard" onClick={autocompleteCard}>
                        <h6 className="font-medium text-base">Autocomplete Credit Card</h6>
                        <p>**** **** **** 4324 VISA</p>
                      </div>
                    )}
                  </div>
                  <div className="w-1/3">
                    <p
                      dangerouslySetInnerHTML={{
                        __html: t('Rental.Review.Payment.Card.Holder'),
                      }}
                    />
                    <Input
                      type="text"
                      placeholder="Andrea Paz"
                      {...register('x-name', { required: true })}
                      errors={errors['x-name']}
                    />
                  </div>
                </div>
                <div className="flex my-4">
                  <div className="w-1/6 mr-8">
                    <p
                      dangerouslySetInnerHTML={{
                        __html: `${t('Rental.Review.Payment.Card.Month')}/${t(
                          'Rental.Review.Payment.Card.Year'
                        )}`,
                      }}
                    />
                    <Input
                      placeholder="MM/AA"
                      {...register('x-expiry', { required: true })}
                      errors={errors['x-expiry']}
                    />
                  </div>
                  <div className="w-1/12">
                    <p
                      dangerouslySetInnerHTML={{
                        __html: t('Rental.Review.Payment.Card.CVV'),
                      }}
                    />
                    <Input
                      type="password"
                      placeholder="***"
                      {...register('x-code', { required: true })}
                      errors={errors['x-code']}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="w-1/4">
              <div className="bg-teal-600 p-4 rounded">
                <h2 className="text-white font-medium text-3xl">{t('Roomio.Summary.Summary')}</h2>
                <div className="py-4 border-b border-white">
                  <div className="my-4">
                    <p className="text-white text-xl font-bold my-1">
                      {t('Roomio.Summary.Price', { count: nights })}
                    </p>
                    <p className="text-right text-xl text-white flex items-center justify-end">
                      {formatCurrency(price)}
                      <FlashSaleBadge remainingMs={priceRemaining} />
                    </p>
                  </div>
                  <div className="my-4">
                    <p className="text-white text-xl font-bold my-1">
                      {t('Roomio.Summary.Taxes')}
                    </p>
                    <p className="text-right text-xl text-white flex items-center justify-end">
                      {formatCurrency(taxes)}
                      <FlashSaleBadge remainingMs={taxesRemaining} />
                    </p>
                  </div>
                </div>
                <div className="flex justify-between py-2 items-center">
                  <h4 className="text-white text-3xl ">{t('Roomio.Summary.Total')}</h4>
                  <p className="text-2xl text-white flex items-center" id="total">
                    {formatCurrency(price + taxes)}
                    <FlashSaleBadge remainingMs={totalRemaining} />
                  </p>
                </div>
              </div>

              <div className="buttons px-0">
                <button
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-2xl rounded"
                  type="submit"
                >
                  {t('Roomio.Summary.Buy')}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
      <Footer />
      <FinishedTask show={confirmed} website={'Roomio'} data={data} />
    </>
  );
};
