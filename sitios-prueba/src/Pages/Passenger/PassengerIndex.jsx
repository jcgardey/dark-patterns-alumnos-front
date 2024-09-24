import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { DateSelects } from '../../components/Form/DateSelects';
import { Input } from '../../components/Form/Input';
import { RadioSet } from '../../components/Form/RadioSet';
import { Select } from '../../components/Form/CustomSelect';
import { countries, countryNames, range } from '../../components/Form/utils';
import { PageTitle, PrimaryButton } from '../../components/Passenger/common';
import bannerbg from '../../assets/Passenger/banner-bg.jpg';
import searchbg from '../../assets/Passenger/searchbg.png';

import '../../components/Form/Form.css';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const PassengerIndex = ({}) => {
  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm();

  const { t } = useTranslation();

  const nameRules = {
    required: true,
    minLength: {
      value: 2,
      message: 'Debe tener entre 2 y 29 caracteres',
    },
    maxLength: {
      value: 29,
      message: 'Debe tener entre 2 y 29 caracteres',
    },
  };

  const navigate = useNavigate();
  const onSubmit = () => {
    navigate('/check_in/seat');
  };

  const onError = () => {
    // do something
  };

  useEffect(() => {
    document.title = t('Checkin.Passenger.Title');
  }, []);

  return (
    <div className="w-100">
      <div
        style={{ '--image-url': `url(${searchbg})` }}
        className="w-full pb-20 pt-10 px-60 bg-green-700  bg-[image:var(--image-url)] bg-no-repeat bg-right-bottom bg-contain"
      >
        <ul className="flex flex-wrap items-center justify-left text-white pl-0 pb-5">
          <li>
            <a
              href="javascript:void(0)"
              className="mr-4 md:mr-6 border-b-2 pb-5 mx-10"
            >
              <i className="fa-solid fa-sharp fa-plane"></i>{' '}
              {t('Checkin.Home.Flights')}
            </a>
          </li>
          <li>
            <Link
              to="/check_in/info"
              className="mr-4 hover:border-white md:mr-6 border-b-2 border-transparent pb-5 mx-10"
            >
              <i className="fa-solid fa-ticket"></i>{' '}
              {t('Checkin.Home.SelfCheckin')}
            </Link>
          </li>
          <li>
            <a
              href="javascript:void(0)"
              className="mr-4 hover:border-white md:mr-6 border-b-2 border-transparent pb-5 mx-10"
            >
              <i className="fa-solid fa-bell"></i> {t('Checkin.Home.Hotels')}
            </a>
          </li>
          <li>
            <a
              href="javascript:void(0)"
              className="mr-4 hover:border-white md:mr-6 border-b-2 border-transparent pb-5 mx-10"
            >
              <i className="fa-solid fa-car"></i> {t('Checkin.Home.CarHire')}
            </a>
          </li>
        </ul>

        <form className="w-full flex mx-auto justify-evenly onSubmit={onSubmit}">
          <div className="relative w-4/12 white-400">
            <Input
              name={'from'}
              labelClassName="text-white font-bold"
              label={t('Checkin.Passenger.From')}
              register={register}
              rules={nameRules}
              errors={errors.from}
            />
          </div>

          <div className="relative w-4/12">
            <Input
              name={'to'}
              label={t('Checkin.Passenger.To')}
              labelClassName="text-white font-bold"
              register={register}
              rules={nameRules}
              errors={errors.to}
            />
          </div>

          <div className="relative w-100">
            <button
              type="submit"
              className="bg-gray-700 hover:bg-gray-800 p-2 rounded text-white text-lg mt-12 px-10"
            >
              {t('Checkin.Passenger.Search')}
            </button>
          </div>
        </form>
      </div>

      <div
        style={{ '--image-url': `url(${bannerbg})` }}
        className="font-mono max-w-5xl  mx-auto flex justify-evenly bg-[image:var(--image-url)] bg-cover py-16 px-10 my-10 text-white"
      >
        <h1 className="text-4xl text-left w-full uppercase pt-16">
          {t('Checkin.Home.Deals')}
        </h1>
        <span className="text-8xl text-right uppercase text-gray-900 pr-20">
          {t('Checkin.Home.30off')}
        </span>
      </div>
    </div>
  );
};
