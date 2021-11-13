import React from 'react';
import { Link } from 'react-router-dom';
import { IDocLocation } from '@lib/types';

interface NotFoundDocProps {
  docLocation: IDocLocation;
}

const NotFoundDoc: React.FC<NotFoundDocProps> = ({ docLocation }) => {
  return (
    <>
      <h1>Document not found</h1>
      <p>The document at this URL does not exist (yet?) (error 404)</p>
      <p>Here is what you can do now:</p>
      <ul>
        <li>
          Create the document by just{' '}
          <Link to={`/docs/create?docTitle=${docLocation.docTitle}&into=${docLocation.into}`}>
            following this link
          </Link>
        </li>
        <li>
          Go to the <Link to="/wiki/">home page</Link>
        </li>
      </ul>
    </>
  );
};

export default NotFoundDoc;
