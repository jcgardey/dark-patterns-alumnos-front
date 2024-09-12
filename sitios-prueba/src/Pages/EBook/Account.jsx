import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const Account = () => {
  const { t } = useTranslation();
  return (
    <>
      <h1 className="text-2xl my-4 font-medium">
        {t('Ebook.AccountInfo')}
      </h1>

      <div className="flex membership-options">
        <div className="w-1/5">
          <p>Email</p>
        </div>
        <div className="w-3/4">
          <p>
            jhernandez@gmail.com
          </p>
        </div>
        
        <div className="w-1/5">
          <p>{t('Ebook.AccountType')}</p>
        </div>
        <div className="w-3/4">
          <p>
            {t('Ebook.Personal')}
          </p>
        </div>
      </div>

      <div className="flex membership-options">
        <div className="w-1/5">
          <p>{t('Ebook.Password')}</p>
        </div>
        <div className="w-3/4">
          <p>********</p>
        </div>
      </div>
    </>
  );
};
