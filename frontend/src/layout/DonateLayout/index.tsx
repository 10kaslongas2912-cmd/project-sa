import { Outlet } from "react-router-dom";
const MainLayout: React.FC = () => (
  <div>
    <main>
      <Outlet />
    </main>

  </div>
);

export default MainLayout;