import React from 'react';
import { Link } from 'react-router-dom';

interface NotFoundDocProps {
  docName: string;
  into?: string;
}

const NotFoundDoc: React.FC<NotFoundDocProps> = ({ docName, into }) => {
  console.log(docName);
  return (
    <>
      <h1>Document not found</h1>
      <p>The document at this URL does not exist (yet?) (error 404)</p>
      <p>Here is what you can do now:</p>
      <ul>
        <li>
          Create the document by just{' '}
          <Link to={`/docs/create?docName=${docName}&into=${into}`}>following this link</Link>
        </li>
        <li>
          Go to the <a href="">home page</a>
        </li>
      </ul>
    </>
  );
};

export default NotFoundDoc;
