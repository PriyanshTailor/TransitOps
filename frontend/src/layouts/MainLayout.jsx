import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import './MainLayout.css';

const MainLayout = ({ onLogout, userRole }) => {
  return (
    <div className="layout-container">
      <Sidebar userRole={userRole} />
      <div className="main-area">
        <Topbar onLogout={onLogout} userRole={userRole} />
        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
