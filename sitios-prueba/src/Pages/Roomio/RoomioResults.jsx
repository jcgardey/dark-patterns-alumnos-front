import { useEffect, useMemo, useState } from 'react';
import map from '../../assets/Roomio/map.jpg';
import { NavBar } from '../../components/Roomio/NavBar';
import { Footer } from '../../components/Roomio/Footer';
import { Room } from '../../components/Roomio/Room';
import { rooms } from './rooms';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

const Sidebar = () => {
  const { t } = useTranslation();
  return (
    <div className="w-1/5 hotel_sidebar">
      <img src={map} width="100%" />
      <div className="filters">
        <h4>{t('Roomio.Results.Sidebar.Filters')}</h4>

        <label>
          <input className="mx-1" type="checkbox" />
          {t('Roomio.Results.Sidebar.Centre')}
        </label>
        <label>
          <input className="mx-1" type="checkbox" />
          {t('Roomio.Results.Sidebar.Pet')}
        </label>
        <label>
          <input className="mx-1" type="checkbox" />
          {t('Roomio.Results.Sidebar.Pool')}
        </label>
        <label>
          <input className="mx-1" type="checkbox" />
          {t('Roomio.Results.Sidebar.Sauna')}
        </label>
      </div>
    </div>
  );
};

// ---------- Utils
const formatRemaining = (ms) => {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(total / 3600)).padStart(2, '0');
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
};

const useFlashTimer = (minH = 1, maxH = 7) => {
  const deadline = useMemo(() => {
    const hrs = Math.floor(Math.random() * (maxH - minH + 1)) + minH;
    return Date.now() + hrs * 60 * 60 * 1000;
  }, [minH, maxH]);

  const [left, setLeft] = useState(() => deadline - Date.now());
  useEffect(() => {
    const id = setInterval(() => {
      const l = deadline - Date.now();
      setLeft(l > 0 ? l : 0);
    }, 1000);
    return () => clearInterval(id);
  }, [deadline]);

  return left;
};

// ---------- Badge con frases aleatorias y contador
const FlashBadge = () => {
  const phrases = useMemo(
    () => [
      'Flash sale',
      'Oferta especial',
      'No se quede afuera',
      'Solo hoy',
      'Promoción limitada',
    ],
    []
  );
  const phrase = useMemo(
    () => phrases[Math.floor(Math.random() * phrases.length)],
    [phrases]
  );
  const remaining = useFlashTimer(1, 7);

  return (
    <div className="w-full rounded-t bg-yellow-300/90 text-black px-3 py-1 flex items-center justify-between text-sm font-semibold">
      <span>{phrase}</span>
      <span className="tabular-nums">{formatRemaining(remaining)}</span>
    </div>
  );
};

export const RoomioResults = () => {
  useEffect(() => {
    document.body.style.background = 'transparent';
  }, []);

  const nights = dayjs(localStorage.getItem('hotel-end')).diff(
    dayjs(localStorage.getItem('hotel-start')),
    'day'
  );
  localStorage.setItem('hotel-nights', nights);

  const adults = localStorage.getItem('hotel-adults') ?? 0;
  const fullCity = localStorage.getItem('hotel-city') ?? '';
  const city = fullCity !== '' ? fullCity.split(',')[0] : '';

  const { t } = useTranslation();

  const filtered = rooms.filter((room) => room.city.includes(city));

  return (
    <>
      <NavBar />
      <div className="w-11/12 mx-auto flex justify-between">
        <Sidebar />
        <div className="w-3/4 hotel_serp">
          {filtered.length === 0 && (
            <h3 className="text-3xl font-medium text-gray-800 text-center">
              {t('Roomio.Results.NoResults', { city })}
            </h3>
          )}

          {filtered.map((room, i) => (
            <div key={i} className="mb-6 rounded overflow-hidden shadow-sm">
              {/* Badge de flash sale con frase y timer por tarjeta */}
              <FlashBadge />
              <Room room={room} nights={nights} adults={adults} />
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
};
