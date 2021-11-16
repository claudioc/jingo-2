import React from 'react';
import { useNavigate } from 'react-router';
import { useAppState } from '@/AppState';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const appState = useAppState();

  React.useEffect(() => {
    navigate(`wiki/${appState.wikiHome}`, { replace: true });
  }, []);

  return <></>;
};

export default HomePage;
