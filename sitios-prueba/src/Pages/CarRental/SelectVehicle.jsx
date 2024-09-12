import convertible from '../../assets/CarRental/convertible.avif';
import pickup from '../../assets/CarRental/pickup.avif';
import sporty from '../../assets/CarRental/sporty.avif';
import standard_pickup from '../../assets/CarRental/standard_pickup.avif';
import standard from '../../assets/CarRental/standard.webp';
import standard_suv from '../../assets/CarRental/standard_suv.avif';

import people from '../../assets/CarRental/people.svg';
import bag from '../../assets/CarRental/bag.svg';
import { useEffect, useState } from 'react';
import { dateString } from '../../utils/date';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CarFilters } from '../../components/CarRent/CarFilters';

const Vehicle = ({ vehicle, onSelect }) => {
  const { t } = useTranslation();

  return (
    <div
      onClick={() => onSelect(vehicle)}
      className="bg-white p-4 flex w-4/5 mx-auto my-3"
    >
      <div className="w-1/3">
        <h3 className="text-slate-700 text-2xl font-bold">{vehicle.name}</h3>
        {t('Rental.Vehicle.'+[vehicle.capType])}
        <p className="my-1 text-grey-800 italic">
          {vehicle.description} {t('Rental.Vehicle.Similar')}
        </p>
        <div className="flex my-2">
          <div className="mx-2">
            <img className="w-7 mx-auto" src={people} />
            <span>
              {t('Rental.Vehicle.Seats', { count: vehicle.capacity })}
            </span>
          </div>
          <div className="mx-2">
            <img className="w-7 mx-auto bg-red" src={bag} />
            <span>{t('Rental.Vehicle.Bags', { count: vehicle.capacity })}</span>
          </div>
        </div>
      </div>
      <div className="w-1/3">
        <img src={vehicle.img} />
      </div>
      <div className="w-1/3">
        <p className="text-2xl text-center font-bold text-slate-500 my-2">
          &#36;{t('Rental.Vehicle.Price', { price: vehicle.price })}
        </p>
        <button className="w-full bg-slate-700 hover:bg-slate-800 text-white py-2">
          {t('Rental.Vehicle.Select')}
        </button>
      </div>
    </div>
  );
};

export const SelectVehicle = ({}) => {
  const [reservation, setReservation] = useState({});

  const navigate = useNavigate();

  const vehicles = [
    {
      name: 'Standard',
      type: 'sedan',
      capType: 'Sedan',
      description: 'VW Jetta',
      capacity: 5,
      price: 32.99,
      img: standard,
    },
    {
      name: 'Standard SUV',
      type: 'suv',
      capType: 'SUV',
      description: 'Ford Edge',
      capacity: 5,
      price: 41.15,
      img: standard_suv,
    },
    {
      name: 'Pickup',
      type: 'pickup',
      capType: 'Pickup',
      description: 'Ford F150',
      capacity: 4,
      price: 45.95,
      img: pickup,
    },
    {
      name: 'Standard Pickup',
      type: 'pickup',
      capType: 'Pickup',
      capacity: 4,
      price: 46.06,
      img: standard_pickup,
    },
    {
      name: 'Convertible',
      type: 'convertible',
      capType: 'Convertible',
      description: 'Ford Mustang',
      capacity: 4,
      price: 65.23,
      img: convertible,
    },
    {
      name: 'Sporty Car',
      type: 'sporty',
      capType: 'Sporty',
      description: 'Dodge Challenger',
      capacity: 4,
      price: 68.65,
      img: sporty,
    },
  ];

  useEffect(() => {
    document.title = t('Rental.SelectVehicle');
    setReservation(JSON.parse(localStorage.getItem('reservation')));
  }, []);

  const onSelect = (vehicle) => {
    localStorage.setItem(
      'reservation',
      JSON.stringify({ ...reservation, vehicle })
    );
    navigate('/car_rental/protection');
  };

  const { t, i18n } = useTranslation();

  const availableFilters = {
    type: [
      { value: 'sedan', label: t('Rental.Vehicle.Sedan') },
      { value: 'suv', label:  t('Rental.Vehicle.SUV')},
      { value: 'coupe', label:  t('Rental.Vehicle.Coupe')},
      { value: 'convertible', label:  t('Rental.Vehicle.Convertible')},
      { value: 'pickup', label:  t('Rental.Vehicle.Pickup')}
    ],
    seats: [
      { value: 2, label: '2+' },
      { value: 4, label: '4+' },
      { value: 6, label: '6+' },
    ],
  };

  const initialFilters = { type: [], seats: [] };
  const [filters, setFilters] = useState(initialFilters);

  const miniumCapacity = () => {
    const minimum = filters.seats.reduce(
      (acc, seat) => (seat < acc ? seat : acc),
      16
    );
    return minimum === 16 ? 0 : minimum;
  };

  const filterVehicles = (vehicles) => {
    const targetTypes =
      filters.type.length == 0
        ? availableFilters.type.map((filter) => filter.value)
        : filters.type;

    return vehicles.filter(
      (v) => targetTypes.includes(v.type) && v.capacity >= miniumCapacity()
    );
  };

  return (
    <div className="bg-slate-700 p-4 min-h-screen">
      <div className="mx-auto w-2/5">
        <div className="bg-slate-800 flex justify-center text-white text-lg p-1">
          <p className="mx-2">{reservation.location}</p>
          <p className="mx-2">
            {dateString(new Date(reservation.startDate), i18n.language)} -{' '}
            {dateString(new Date(reservation.endDate), i18n.language)}
          </p>
        </div>
      </div>
      <h2 className="text-3xl my-2 text-white font-bold">
        {t('Rental.SelectVehicle')}
      </h2>
      <div className="flex my-4">
        <div className="w-1/5 my-4">
          <CarFilters
            availableFilters={availableFilters}
            filters={filters}
            setFilters={setFilters}
          />
        </div>
        <div className="w-4/5">
          {filterVehicles(vehicles).map((vehicle, i) => (
            <Vehicle key={i} vehicle={vehicle} onSelect={onSelect} />
          ))}
        </div>
      </div>
    </div>
  );
};
