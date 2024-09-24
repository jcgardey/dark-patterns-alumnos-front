import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const NavBar = () => {
  const [dropdown, setDropdown] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="head px-12 py-8 text-gray-500 border-b-2 border-fuchsia-500">
      <div className="flex">
        <div className="w-1/3">
          <Link to={'/ebook'} className="text-2xl logo">
            <i className="fa-solid fa-sharp fa-book-bookmark text-fuchsia-500"></i>{' '}
            ebook
            <span className="text-fuchsia-500">world</span>
          </Link>
        </div>
        <div className="w-1/3">
          <div className="flex w-full items-center">
            <input
              type="text"
              className="w-full p-1 px-2 border border-gray-300 placeholder-gray-400 rounded rounded-r-none"
              placeholder={t('Roomio.Search.Search')}
              aria-label="Recipient's username"
              aria-describedby="basic-addon2"
            />
            <button
              className="bg-fuchsia-500 border border-fuchsia-500 rounded-r text-white py-1 px-2"
              type="button"
            >
              <i className="fa-solid fa-sharp fa-magnifying-glass"></i>
            </button>
          </div>
        </div>
        <div className="w-1/3 flex justify-end relative">
          <div>
            <a
              className="flex justify-center items-center text-gray-600 hover:cursor-pointer"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              onClick={() => setDropdown(!dropdown)}
            >
              <div className="w-10 h-10 mx-1 flex justify-center items-center rounded-full bg-gray-300">
                <i className="fa-solid fa-sharp fa-user"></i>
              </div>
              <i className="fa-solid fa-caret-down"></i>
            </a>
            {dropdown && (
              <ul className="absolute my-1 right-0 border border-gray-300 rounded bg-white text-gray-700">
                <li className="hover:bg-gray-100 p-0 m-0">
                  <Link
                    to="/ebook/account"
                    onClick={() => setDropdown(!dropdown)}
                    className="dropdown-item px-4 py-1 block w-full"
                  >
                    {t('Ebook.AccountInfo')}
                  </Link>
                </li>
                <li className="hover:bg-gray-100">
                  <Link
                    to="/ebook/membership"
                    onClick={() => setDropdown(!dropdown)}
                    className="dropdown-item px-4 py-1 block w-full"
                  >
                    {t('Ebook.MyMembership')}
                  </Link>
                </li>
                <li className="hover:bg-gray-100">
                  <a className="dropdown-item px-4 py-1 block w-full" href="javascript:void(0)">
                    {t('Ebook.Logout')}
                  </a>
                </li>
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
