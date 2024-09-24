import { useEffect } from 'react';
import { NavBar } from '../../components/EBook/NavBar';
import { Footer } from '../../components/EBook/Footer';
import './books.css';
import { Link, Outlet } from 'react-router-dom';
import { updateDarkPatternState } from '../../utils/dark_patterns';
import { useTranslation } from 'react-i18next';

export const Home = () => {
  
  const { t } = useTranslation();
  
  useEffect(() => {
    updateDarkPatternState();
  }, []);

  return (
    <>
      <NavBar />
      <div className="flex">
        <div className="w-1/6 sidebar px-8">
          <ul>
            <li>
              <Link to="/ebook">
                <i className="fa-solid fa-sharp fa-house"></i>  {t('Ebook.Home')}
              </Link>
            </li>
            <li>
              <a href="javascript:void(0)">
                <i className="fa-solid fa-sharp fa-bookmark"></i> {t('Ebook.Saved')}
              </a>
            </li>
            <li className="separator"></li>
            <li>
              <a href="javascript:void(0)">
                <i className="fa-solid fa-sharp fa-star"></i> {t('Ebook.Recommended')}
              </a>
            </li>
            <li>
              <a href="javascript:void(0)">
                <i className="fa-solid fa-sharp fa-book"></i> {t('Ebook.Books')}
              </a>
            </li>
            <li>
              <a href="javascript:void(0)">
                <i className="fa-solid fa-sharp fa-headphones"></i> {t('Ebook.Audiobooks')}
              </a>
            </li>
          </ul>
        </div>
        <div className="w-3/4 mx-auto main-content pb-40">
          <Outlet />
        </div>
      </div>
      
      <Footer />
    </>
  );
};
