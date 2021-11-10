import React from 'react';
import { http } from '@lib/http';
import { TDoc } from '@lib/types';

const Edit: React.FC = () => {
  const [loading, setLoading] = React.useState<boolean>();
  const [doc, setDoc] = React.useState<TDoc | null>();

  const params = React.useMemo(() => new URLSearchParams(location.search), [location]);

  const fetchWikiContent = React.useCallback(async () => {
    setLoading(true);
    const docName = params.get('docName');
    const response = await http<TDoc>('get', `/api/doc/update?docName=${docName}`);

    if (response.error) {
      if (response.statusCode === 404) {
        setDoc(null);
      } else {
        console.error(`Something went wrong while fetching ${docName}`);
      }
    } else {
      setDoc(response.data);
    }
    setLoading(false);
  }, []);

  React.useEffect(() => {
    fetchWikiContent();
  }, [fetchWikiContent]);

  if (loading) {
    return <span>Loading…</span>;
  }

  return <div>{doc?.codeHighlighterTheme}</div>;
};

export default Edit;
