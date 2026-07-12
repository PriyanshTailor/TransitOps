import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import './MainLayout.css';

const MainLayout = ({ onLogout }) => {
  return (
    <div className="layout-container">
      <Sidebar />
      <div className="main-area">
        <Topbar onLogout={onLogout} />
        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
