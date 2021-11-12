import React from 'react';
import { http } from '@lib/http';
import { useParams, useLocation, useNavigate } from 'react-router';
import { TDoc, TDocLocation, TFolder } from '@lib/types';
import Document from './Document';
import Folder from './Folder';
import NotFoundDoc from './NotFoundDoc';
import NotFoundFolder from './NotFoundFolder';

const Wiki: React.FC = () => {
  const navigate = useNavigate();
  const [doc, setDoc] = React.useState<TDoc | null>();
  const [folder, setFolder] = React.useState<TFolder | null>();
  const [newDoc, setNewDoc] = React.useState<TDocLocation>();
  const [loading, setLoading] = React.useState<boolean>();
  const urlParams = useParams();
  const location = useLocation();

  /* We need to handle 3 cases
   * - we are in the wiki front page: /wiki or /wiki/
   * - we are in a wiki folder: /wiki/some/folder/
   * - we are in a wiki page: /wiki/some_page or /wiki/some_folder/some_page
   */
  const path = urlParams['*'];
  const isAnyFolder = React.useMemo(() => path === '' || path?.endsWith('/'), [path]);
  const isAnyDoc = !isAnyFolder;

  const fetchWikiContent = React.useCallback(async () => {
    setLoading(true);
    let response;

    if (isAnyDoc) {
      setFolder(undefined);
      response = await http<TDoc | TDocLocation>('get', `/api/wiki/${path}`);
    } else {
      setDoc(undefined);
      response = await http<TFolder>('get', `/api/wiki/${path}`);
    }

    if (response.error) {
      if (response.statusCode === 404) {
        if (isAnyDoc) {
          setNewDoc(response.data as TDocLocation);
        }
        isAnyFolder ? setFolder(null) : setDoc(null);
      } else {
        console.error(`Something went wrong while fetching ${path}`);
      }
    } else {
      isAnyFolder ? setFolder(response.data as TFolder) : setDoc(response.data as TDoc);
    }
    setLoading(false);
  }, [path, isAnyFolder, isAnyDoc]);

  React.useEffect(() => {
    if (location.pathname === '/wiki') {
      navigate('/wiki/');
    } else {
      fetchWikiContent();
    }
  }, [urlParams, fetchWikiContent]);

  if (loading) {
    return <span>Loading…</span>;
  }

  return (
    <>
      {doc && <Document doc={doc as TDoc} />}
      {folder && <Folder folder={folder} />}
      {isAnyFolder && folder === null && <NotFoundFolder />}
      {isAnyDoc && doc === null && newDoc && (
        <NotFoundDoc docName={newDoc?.docName} into={newDoc?.into} />
      )}
    </>
  );
};

export default Wiki;
