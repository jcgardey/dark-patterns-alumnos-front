import { Outlet } from 'react-router-dom';
import { NavBar } from '../../components/Passenger/NavBar';
import { Footer } from '../../components/Passenger/Footer';
import { Subscriber } from '../../components/Passenger/Subscriber';
import { useEffect } from 'react';
import { updateDarkPatternState } from '../../utils/dark_patterns';

export const PassengerHome = () => {
  useEffect(() => {
    updateDarkPatternState();
  }, []);

  return (
    <>
      <NavBar />
      <Outlet />
      <Subscriber />
      <Footer />
    </>
  );
};
