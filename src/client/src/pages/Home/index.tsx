import React from 'react';
import { http } from '@utils/http';

const HomePage: React.FC = () => {
  const fetchHomePage = React.useCallback(async () => {
    const response = await http<string>('get', '/api/wikiHome');
  }, []);

  React.useEffect(() => {
    fetchHomePage();
  }, []);

  return <span>Boo</span>;
};

export default HomePage;
