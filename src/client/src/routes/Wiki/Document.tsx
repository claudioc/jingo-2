import React from 'react';
import { Link } from 'react-router-dom';
import { IDoc } from '@lib/types';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ITransformLink {
  href?: string;
  children: React.ReactNode & React.ReactNode[];
  title?: string;
}

const RouterLink = (props: ITransformLink) => {
  return props?.href?.match(/^http/) ? (
    <a href={props.href}>{props.children}</a>
  ) : (
    <Link to={`/wiki/${props.href}`}>{props.children}</Link>
  );
};

interface IDocumentProps {
  doc: IDoc;
}

const Document: React.FC<IDocumentProps> = ({ doc }) => {
  return (
    <>
      <article>
        <h2>{doc.docTitle}</h2>
        <Markdown remarkPlugins={[remarkGfm]} components={{ a: RouterLink }}>
          {doc.content}
        </Markdown>
      </article>
      <div>
        <Link to={`/docs/edit?docName=${doc.docName}&into=${doc.dirName}`}>Edit</Link>
      </div>
    </>
  );
};

export default Document;
