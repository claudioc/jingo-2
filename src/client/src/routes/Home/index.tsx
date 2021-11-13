import React from 'react';
import { apiRequest } from '@lib/api-request';
import { IDoc } from '@lib/types';
import Welcome from './Welcome';
import { useNavigate } from 'react-router';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [welcome, setWelcome] = React.useState<boolean>(false);

  // Probe the home page and if it exists, move to its wiki page, otherwise show the welcome page
  // FIXME this is not optimal since it will end up fetching the page twice
  // FIXME the "Home" is parameter
  const fetchHomePage = React.useCallback(async () => {
    const response = await apiRequest<IDoc>('get', '/api/wiki/Home');
    if (response.error) {
      if (response.statusCode === 404) {
        // Show the welcome page
        setWelcome(true);
      } else {
        console.error('Something went wrong while fetching the home page');
      }
    } else {
      navigate('wiki/Home');
    }
  }, []);

  React.useEffect(() => {
    fetchHomePage();
  }, []);

  return welcome ? <Welcome /> : <span>Loading…</span>;
};

export default HomePage;
