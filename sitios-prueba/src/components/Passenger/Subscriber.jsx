import { Link } from 'react-router-dom';
import { PageTitle, PrimaryButton } from './common';
import { useTranslation } from 'react-i18next';

export const Subscriber = ({}) => {
  const { t } = useTranslation();
  return (
    <div className="flex bg-gray-200 px-12 pb-20 pt-5 mt-20">
      <div className="w-4/12 pt-10">
        <h1 className="text-2xl font-bold text-green-700">
          {' '}
          {t('Checkin.Home.Subscribe')}
        </h1>
        <p>{t('Checkin.Home.MissSale')}</p>
      </div>

      <div className="w-4/12 pt-10 pl-10">
        <ul className="list-disc">
          <li>{t('Checkin.Home.LearnDeals')}</li>
          <li>{t('Checkin.Home.Promotions')}</li>
          <li>{t('Checkin.Home.NewDestinations')}</li>
        </ul>
      </div>

      <div className="w-4/12">
        <div className="form-field">
          <label className="form-label">Email</label>
          <input name="email" type="text" className="form-input" />
        </div>
        <PrimaryButton type="submit">
          {t('Checkin.Passenger.Subscribe')}
        </PrimaryButton>
      </div>
    </div>
  );
};
