import React from 'react';
import { http } from '@utils/http';
import { useParams } from 'react-router';

const WikiPage: React.FC = () => {
  let urlParams = useParams();
  const fetchWikiPage = React.useCallback(async () => {
    const response = await http<string>('get', `/api/wiki/${urlParams.page}`);
  }, []);

  React.useEffect(() => {
    fetchWikiPage();
  }, []);

  return <span>Requesting</span>;
};

export default WikiPage;
