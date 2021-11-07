import { Outlet } from 'react-router-dom';
import { Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/Home';
import WikiPage from './pages/Wiki';

function App() {
  return (
    <main>
      <header>Jingo</header>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          {/* <Route path="about" element={<About />} /> */}
          <Route path="wiki/:page" element={<WikiPage />} />
          <Route path="*" element={<NoMatch />} />
        </Route>
      </Routes>
    </main>
  );
}

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
