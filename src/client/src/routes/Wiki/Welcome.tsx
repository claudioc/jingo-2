import { Link } from 'react-router-dom';
import { useAppState } from '@/AppState';

const Welcome: React.FC = () => {
  const appState = useAppState();

  return (
    <>
      <h1>Welcome to {appState.websiteName}</h1>
      <p>
        You are reading this page either because your document repository is still completely empty,
        or the document that you have defined as the &quot;index&quot; doesn&apos;t exist yet or the
        server is misconfigured.
      </p>

      <p>Please select one of the following options</p>

      <ul>
        <li>
          Create the{' '}
          <Link to={`/docs/create?docTitle=${appState.wikiHome}`}>
            <em>index</em> document
          </Link>
        </li>
        <li>
          Open the <Link to="/wiki/">document list</Link>
        </li>
        <li>
          <Link to="/">Reload this page</Link>
        </li>
      </ul>
    </>
  );
};

export default Welcome;
