import React from 'react';
import { Link } from 'react-router-dom';
import { TDoc } from '@lib/types';
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
  doc: TDoc;
}

const Document: React.FC<IDocumentProps> = ({ doc }) => {
  return (
    <>
      <article>
        <Markdown remarkPlugins={[remarkGfm]} components={{ a: RouterLink }}>
          {doc.content}
        </Markdown>
      </article>
      <div>
        <Link to={`/docs/edit?docName=${doc.docName}`}>Edit</Link>
      </div>
    </>
  );
};

export default Document;
