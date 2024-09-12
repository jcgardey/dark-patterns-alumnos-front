import { useTranslation } from 'react-i18next';
import logo from '../../assets/CarRental/logo.png';

const Link = ({ children }) => (
  <a
    href="javascript:void(0)"
    className="text-slate-700 text-xl font-bold mx-2 hover:underline hover:decoration-slate-800"
  >
    {children}
  </a>
);

export const NavBar = () => {
  const { t } = useTranslation();
  return (
    <div className="flex h-24 items-center">
      <img src={logo} className="h-12 mr-2 border-r border-slate-700 px-4" />
      <Link>{t('Rental.NavBar.Reservations')}</Link>
      <Link>{t('Rental.NavBar.Deals')}</Link>
      <Link>{t('Rental.NavBar.Vehicles')}</Link>
      <Link>{t('Rental.NavBar.Locations')}</Link>
    </div>
  );
};
