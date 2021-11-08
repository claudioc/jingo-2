import React from 'react';
import { http } from '@lib/http';
import { useParams } from 'react-router';
import { TDoc } from '@lib/types';
import NotFound from './NotFound';

const WikiPage: React.FC = () => {
  const [doc, setDoc] = React.useState<TDoc | null>();
  const urlParams = useParams();

  const fetchWikiPage = React.useCallback(async () => {
    console.log('Fetching' + urlParams.page);
    const response = await http<TDoc>('get', `/api/wiki/${urlParams.page}`);
    if (response.error) {
      if (response.statusCode === 404) {
        // Show the "create page?" page
        setDoc(null);
      } else {
        console.error('Something went wrong while fetching the home page');
      }
    } else {
      console.log(response.data);
      setDoc(response.data);
    }
  }, [urlParams]);

  React.useEffect(() => {
    fetchWikiPage();
  }, [urlParams]);

  if (doc === undefined) {
    return <span>Loading…</span>;
  }

  return (
    <>
      {doc && (
        <div
          dangerouslySetInnerHTML={{
            __html: doc.content
          }}
        ></div>
      )}
      {!doc && <NotFound />}
    </>
  );
};

export default WikiPage;
