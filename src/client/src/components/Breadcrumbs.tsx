import { useLocation } from 'react-router-dom';

const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  console.log(location);

  const parts = location.pathname.split('/');

  return (
    <ul>
      <li>Booo</li>
    </ul>
  );
};

export default Breadcrumbs;
