import { Link } from 'react-router-dom';
import logo from '../../assets/Passenger/airlogo.svg';
import { useTranslation } from 'react-i18next';

export const NavBar = ({}) => {
  const { t } = useTranslation();
  return (
    <div className="head px-8 text-green-100 bg-green-700 py-2">
      <div class="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <div className="flex items-center">
          <Link to="/check_in">
            <h1 className="logo">
              <img src={logo} className="inline" /> air
              <span className="text-white">somewhere</span>
            </h1>
          </Link>
        </div>

        <div class="hidden w-full md:block md:w-auto" id="navbar-default">
          <ul class="font-medium flex flex-col p-4 md:p-0 mt-4 border md:flex-row md:space-x-8 md:mt-0 md:border-0">
            <li>
              <a
                href="#/check_in"
                class="block py-2 pl-3 pr-4 text-white bg-white-700 rounded md:bg-transparent md:text-green-200 md:p-0"
              >
                {t('Checkin.Home.Home')}
              </a>
            </li>
            <li>
              <Link
              to="/check_in/info"
                class="block py-2 pl-3 pr-4 text-gray-100 rounded md:hover:bg-transparent md:border-0 md:hover:text-green-200 md:p-0"
              >
                {t('Checkin.Home.CheckIn')}
              </Link>
            </li>
            <li>
              <a
                href="javascript:void(0)"
                class="block py-2 pl-3 pr-4 text-gray-100 rounded md:hover:bg-transparent md:border-0 md:hover:text-green-200 md:p-0"
              >
                {t('Checkin.Home.Services')}
              </a>
            </li>
            <li>
              <a
                href="javascript:void(0)"
                class="block py-2 pl-3 pr-4 text-gray-100 rounded md:hover:bg-transparent md:border-0 md:hover:text-green-200 md:p-0"
              >
                {t('Checkin.Home.Terms')}
              </a>
            </li>
            <li>
              <a
                href="javascript:void(0)"
                class="block py-2 pl-3 pr-4 text-gray-100 rounded md:hover:bg-transparent md:border-0 md:hover:text-green-200 md:p-0"
              >
                {t('Checkin.Home.Contact')}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
