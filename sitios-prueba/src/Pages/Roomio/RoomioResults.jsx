import { useEffect, useTransition } from 'react';
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
  const city = fullCity != '' ? fullCity.split(',')[0] : '';

  const { t } = useTranslation();

  return (
    <>
      <NavBar />
      <div className="w-11/12 mx-auto flex justify-between">
        <Sidebar />
        <div className="w-3/4 hotel_serp">
          {rooms.filter((room) => room.city.includes(city)).length == 0 && (
            <h3 className="text-3xl font-medium text-gray-800 text-center">
              {t('Roomio.Results.NoResults', { city })}
            </h3>
          )}
          {rooms
            .filter((room) => room.city.includes(city))
            .map((room, i) => (
              <Room key={i} room={room} nights={nights} adults={adults} />
            ))}
        </div>
      </div>
      <Footer />
    </>
  );
};
