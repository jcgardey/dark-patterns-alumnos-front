import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FinishedTask } from '../../components/FinishedTask';

export const BooksOffer = () => {
  const { t } = useTranslation();
  const [membershipCancelled, setMembershipCancelled] = useState(false);

  const cancelMembership = () => {
    setMembershipCancelled(true);
  };

  return (
    <div className="membership offer">
      <h3 className="text-3xl my-8">{t('Ebook.Tease.Before')}</h3>
      <div className="flex justify-center">
        <div className="w-2/5 item">
          <i className="fa-solid fa-sharp fa-calendar-days"></i>
          <h6>{t('Ebook.Tease.Extend')}</h6>
          <p className="text-sm text-gray-500">{t('Ebook.Tease.Stay')}</p>
          <button
            type="button"
            className="bg-fuchsia-500 rounded p-2 text-lg text-white hover:bg-fuchsia-600 border border-fuchsia-600"
          >
            {t('Ebook.Tease.Get30')}
          </button>
        </div>
        <div className="w-2/5 item">
          <i className="fa-solid fa-sharp fa-medal"></i>
          <h6>{t('Ebook.Tease.Try')}</h6>
          <p className="text-sm text-gray-500">{t('Ebook.Tease.Keep')}</p>
          <button
            type="button"
            className="bg-fuchsia-500 rounded p-2 text-lg text-white hover:bg-fuchsia-600 border border-fuchsia-600"
          >
            {t('Ebook.Tease.TryLite')}
          </button>
        </div>
      </div>
      <p className="cancel">
        {t('Ebook.Tease.Still')}{' '}
        <button
          className="underline text-fuchsia-500"
          onClick={cancelMembership}
        >
          {t('Ebook.Tease.End')}
        </button>
      </p>
      <FinishedTask show={membershipCancelled} website="Roomio" />
    </div>
  );
};
