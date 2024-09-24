import { useEffect, useState } from 'react';
import './CarRental.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import car_illustration from '../../assets/CarRental/car_illustration.avif';
import { NavBar } from '../../components/CarRent/NavBar';
import { updateDarkPatternState } from '../../utils/dark_patterns';
import cities from '../../utils/cities.json';
import ReactSelect from 'react-select';

const Label = ({ children }) => (
  <label className="text-white text-lg">{children}</label>
);

export function CarRental() {
  useEffect(() => {
    document.title = t('Rental.Title');
    updateDarkPatternState();

    const params = new URLSearchParams(document.location.href.split('?')[1]);
    localStorage.setItem('ux-analyzer-token', params.get('token'));
  }, []);

  const navigate = useNavigate();

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [location, setLocation] = useState('');
  const [showCities, setShowCities] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    if (location !== '' && startDate !== '' && endDate !== '') {
      localStorage.setItem(
        'reservation',
        JSON.stringify({ location: location.value, startDate, endDate })
      );
      navigate('/car_rental/vehicle');
    }
  };

  const { t } = useTranslation();

  const Card = ({ title, description, className }) => (
    <div className={`p-4 bg-white box-shadow ${className}`}>
      <h4 className="font-bold text-slate-800 text-xl my-2">{title}</h4>
      <p className="text-slate-800 font-medium">{description}</p>
    </div>
  );

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };

  return (
    <>
      <NavBar />
      <div className="bg-slate-500 p-4">
        <h2 className="text-2xl text-white font-semibold">
          {t('Rental.Start')}
        </h2>
        <form onSubmit={onSubmit}>
          <div className="my-4 flex items-end gap-6">
            <div className="w-1/4 relative">
              <Label>{t('Rental.Location')}</Label>
              <ReactSelect
                name={'location'}
                components={{ DropdownIndicator:() => null, IndicatorSeparator:() => null }}
                classNames={{ control: (state) => 'h-10' }}
                classNamePrefix='CarRent'
                value={location}
                onChange={(newValue) => setLocation(newValue)}
                isClearable
                openMenuOnFocus={false}
                openMenuOnClick={false}
                options={cities.map((c) => ({
                  label: `${c.nombre}, ${c.pais}`,
                  value: `${c.nombre}, ${c.pais}`,
                }))}
              />
            </div>
            <div className="w-1/5">
              <Label>{t('Rental.Dates')}</Label>
              <DatePicker
                className="w-full rounded px-2 h-10"
                wrapperClassName="w-full"
                selected={startDate}
                onChange={handleDateChange}
                selectsRange
                startDate={startDate}
                endDate={endDate}
                minDate={new Date()}
                dateFormat="dd/MM/yyyy"
              />
            </div>
            <button
              type="submit"
              className="bg-yellow-300 hover:bg-yellow-400 px-4 py-2 rounded-lg text-xl font-semibold"
            >
              {t('Rental.Search')}
            </button>
          </div>
        </form>
      </div>
      <div className="h-screen bg-slate-600 p-8">
        <img className="w-1/2 mx-auto" src={car_illustration} />
        <div className="w-3/4 mx-auto my-4">
          <h2 className="text-white font-bold text-3xl border-b p-2">
            {t('Rental.Featured.Title')}
          </h2>
          <div className="flex justify-between my-4">
            <Card
              title={t('Rental.Featured.Last_Minute.Title')}
              description={t('Rental.Featured.Last_Minute.Description')}
              className="w-1/3"
            />
            <Card
              title={t('Rental.Featured.Plan_Ahead.Title')}
              description={t('Rental.Featured.Plan_Ahead.Description')}
              className="w-1/3"
            />
          </div>
        </div>
      </div>
    </>
  );
}
