import React from 'react';
import { apiRequest } from '@lib/api-request';
import { IDoc } from '@lib/types';
import Welcome from './Welcome';
import { useNavigate } from 'react-router';
import { useAppState } from '@/AppState';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [welcome, setWelcome] = React.useState<boolean>(false);
  const appState = useAppState();
  const [error, setError] = React.useState<string>();

  // Probe the home page and if it exists, move to its wiki page, otherwise show the welcome page
  // FIXME this is not optimal since it will end up fetching the page twice
  const fetchHomePage = React.useCallback(async () => {
    const response = await apiRequest<IDoc>('get', `/api/wiki/${appState.wikiHome}`);
    if (response.error) {
      if (response.statusCode === 404) {
        setWelcome(true);
      } else {
        setError('Something went wrong while fetching the home page');
      }
    } else {
      navigate(`wiki/${appState.wikiHome}`);
    }
  }, []);

  React.useEffect(() => {
    fetchHomePage();
  }, []);

  if (error) {
    return <div>{error}</div>;
  }
  return welcome ? <Welcome /> : <span>Loading…</span>;
};

export default HomePage;
