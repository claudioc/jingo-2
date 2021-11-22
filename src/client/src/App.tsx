import { Outlet, Routes, Route, Link } from 'react-router-dom';
import HomePage from './routes/Home';
import Wiki from './routes/Wiki';
import DocsEdit from './routes/Docs/Edit';
import DocsCreate from './routes/Docs/Create';
import FoldersCreate from './routes/Folders/Create';
import Breadcrumbs from './components/Breadcrumbs';

function App() {
  return (
    <main>
      <header>
        <Link to="/wiki/">Jingo</Link>
      </header>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route caseSensitive={true} path="wiki/*" element={<Wiki />} />
          <Route path="docs">
            <Route path="edit" element={<DocsEdit />} />
            <Route path="create" element={<DocsCreate />} />
          </Route>
          <Route path="folders">
            <Route path="create" element={<FoldersCreate />} />
          </Route>
          <Route path="*" element={<NoMatch />} />
        </Route>
      </Routes>
    </main>
  );
}

const Layout: React.FC = () => {
  return (
    <>
      <nav>
        <Breadcrumbs />
      </nav>
      <div>
        <Link to="/docs/create">New document</Link>&nbsp;
        <Link to="/folders/create">New folder</Link>
        <Outlet />
      </div>
    </>
  );
};

const NoMatch: React.FC = () => {
  return (
    <div>
      <h2>Nothing to see here!</h2>
      <p>
        <Link to="/">Go to the home page</Link>
      </p>
    </div>
  );
};

export default App;
