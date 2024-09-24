import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const Membership = () => {
  const { t } = useTranslation();
  return (
    <>
      <h1 className="text-2xl my-4 font-medium">
        {t('Ebook.Membership.Details')}
      </h1>
      <div className="benefits">
        <h4> {t('Ebook.Membership.Unlimited')}</h4>
        <ul>
          <li>
            <i className="fa-solid fa-sharp fa-book"></i>
            <p> {t('Ebook.Membership.Books')}</p>
            <span> {t('Ebook.Membership.Read')}</span>
          </li>
          <li>
            <i className="fa-solid fa-sharp fa-headphones"></i>
            <p> {t('Ebook.Membership.Audiobooks')}</p>
            <span>{t('Ebook.Membership.Listen')}</span>
          </li>
          <li>
            <i className="fa-solid fa-sharp fa-stopwatch"></i>
            <p>{t('Ebook.Membership.Snapshots')}</p>
            <span>{t('Ebook.Membership.Gain')}</span>
          </li>
          <li>
            <i className="fa-solid fa-sharp fa-file"></i>
            <p>{t('Ebook.Membership.Documents')}</p>
            <span>{t('Ebook.Membership.community')}</span>
          </li>
          <li>
            <i className="fa-solid fa-sharp fa-book-open"></i>
            <p>{t('Ebook.Membership.Magazines')}</p>
            <span>{t('Ebook.Membership.Find')}</span>
          </li>
          <li>
            <i className="fa-solid fa-sharp fa-music"></i>
            <p>{t('Ebook.Membership.Sheet')}</p>
            <span>{t('Ebook.Membership.Play')}</span>
          </li>
        </ul>
      </div>

      <div className="flex membership-options">
        <div className="w-1/5">
          <p>{t('Ebook.Membership.Plan')}</p>
        </div>
        <div className="w-3/4">
          <p>
            {t('Ebook.Membership.Your')}
          </p>
          <p className="my-4">
            <Link
              to="/ebook/cancel_membership"
              className="text-fuchsia-500 underline"
            >
              {t('Ebook.Membership.End')}
            </Link>
          </p>
        </div>
      </div>

      <div className="flex membership-options">
        <div className="w-1/5">
          <p>{t('Ebook.Membership.Payment')}</p>
        </div>
        <div className="w-3/4">
          <p>{t('Ebook.Membership.Card')}</p>
          <p className="my-4">
            <a className="text-fuchsia-500 underline" href="javascript:void(0)">
              {t('Ebook.Membership.Update')}
            </a>
          </p>
          <p className="my-4">
            <a className="text-fuchsia-500 underline" href="javascript:void(0)">
              {t('Ebook.Membership.View')}
            </a>
          </p>
        </div>
      </div>
    </>
  );
};
