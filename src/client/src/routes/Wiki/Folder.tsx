import React from 'react';
import { Link } from 'react-router-dom';
import { TFolder } from '@lib/types';

interface IFolderProps {
  folder: TFolder;
}

const Document: React.FC<IFolderProps> = ({ folder }) => {
  return (
    <div>
      <h2>Documents here</h2>
      <ul>
        {folder.docList.map(docName => (
          <li key={docName}>
            <Link to={`${folder.dirName || '/wiki'}/${docName}`}>{docName}</Link>
          </li>
        ))}
      </ul>

      <h2>Folders here</h2>
      <ul>
        {folder.folderList.map(folderName => (
          <li key={folderName}>
            <Link to={`${folderName}/`}>{folderName}</Link>
          </li>
        ))}
      </ul>
      <Link to={`/docs/create?into=${folder.dirName}`}>Create document here</Link>
    </div>
  );
};

export default Document;
