import { Outlet, Routes, Route, Link } from 'react-router-dom';
import HomePage from './routes/Home';
import Wiki from './routes/Wiki';
import DocsEdit from './routes/Docs/Edit';

function App() {
  return (
    <main>
      <header>Jingo</header>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route caseSensitive={true} path="wiki/*" element={<Wiki />} />
          <Route path="docs">
            <Route path="edit" element={<DocsEdit />} />
          </Route>
          <Route path="*" element={<NoMatch />} />
        </Route>
      </Routes>
    </main>
  );
}

//<Route caseSensitive={true} path="wiki/*/" element={<WikiFolder />} />
const Layout: React.FC = () => {
  return (
    <div>
      <span>Part of the layout</span>
      <Outlet />
    </div>
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
