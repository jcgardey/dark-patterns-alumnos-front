import { useEffect, useState } from 'react';
import './Roomio.css';
import DatePicker from 'react-datepicker';

import background from '../../assets/Roomio/bg.jpg';
import { NavBar } from '../../components/Roomio/NavBar';
import { Footer } from '../../components/Roomio/Footer';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { updateDarkPatternState } from '../../utils/dark_patterns';
import { Autocomplete } from '../../components/Form/Autocomplete';
import cities from '../../utils/cities.json';
import ReactSelect from 'react-select';

export const Search = ({}) => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [adults, setAdults] = useState(1);
  const [city, setCity] = useState('');

  const navigate = useNavigate();

  const { t } = useTranslation();

  const handleDatesChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('hotel-start', startDate.toISOString().split('T')[0]);
    localStorage.setItem('hotel-end', endDate.toISOString().split('T')[0]);
    localStorage.setItem('hotel-adults', adults);
    localStorage.setItem('hotel-city', city.value);
    navigate('/roomio/results');
  };

  useEffect(() => {
    updateDarkPatternState();
  }, []);

  return (
    <>
      <div style={{ background: `url(${background})`, minHeight: '100vh' }}>
        <NavBar />
        <form
          className="w-11/12 mx-auto flex items-end justify-evenly bg-white/[.3] rounded-lg p-10 mt-32"
          onSubmit={onSubmit}
        >
          <div className="relative w-1/4">
            <label className="text-white font-bold">
              {t('Roomio.Search.Destination')}
            </label>
            <ReactSelect
              name={'destination'}
              placeholder={t('Roomio.Search.Destination')}
              classNames={{ control: (state) => 'h-11' }}
              classNamePrefix="roomioSelect"
              components={{ DropdownIndicator:() => null, IndicatorSeparator:() => null }}
              value={city}
              onChange={(newValue) => setCity(newValue)}
              isClearable
              openMenuOnFocus={false}
              openMenuOnClick={false}
              options={cities.map((c) => ({
                label: `${c.nombre}, ${c.pais}`,
                value: `${c.nombre}, ${c.pais}`,
              }))}
            />
          </div>
          <div className="w-1/4">
            <label className="text-white font-bold block">
              {t('Roomio.Search.Dates')}
            </label>
            <DatePicker
              className="p-2 text-lg rounded w-full"
              wrapperClassName="w-full"
              selected={startDate}
              onChange={handleDatesChange}
              selectsRange
              startDate={startDate}
              endDate={endDate}
              minDate={new Date()}
              dateFormat="dd/MM/yyyy"
            />
          </div>
          <div>
            <label className="text-white font-bold block">
              {t('Roomio.Search.Adults')}
            </label>
            <select
              className="p-2 text-lg rounded h-7"
              aria-label="Default select example"
              value={adults}
              onChange={(e) => setAdults(e.target.value)}
            >
              <option value="">{t('Roomio.Search.People')}</option>
              <option value="1">
                {t('Roomio.Search.Adult', { count: 1 })}
              </option>
              <option value="2">
                {t('Roomio.Search.Adult', { count: 2 })}
              </option>
              <option value="3">
                {t('Roomio.Search.Adult', { count: 3 })}
              </option>
              <option value="4">
                {t('Roomio.Search.Adult', { count: 4 })}
              </option>
              <option value="5">
                {t('Roomio.Search.Adult', { count: 5 })}
              </option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-green-700 hover:bg-green-800 p-2 rounded text-white text-lg"
          >
            {t('Roomio.Search.Search')}
          </button>
        </form>
      </div>
      <Footer />
    </>
  );
};
