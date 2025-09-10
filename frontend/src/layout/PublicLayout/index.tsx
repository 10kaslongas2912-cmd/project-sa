// src/layouts/MainLayout.tsx
import { Outlet } from "react-router-dom";
import NavigationBar from "../../components/NavigationBar/index";

const MainLayout: React.FC = () => (
  <div>
    <main>
      <Outlet />
        <NavigationBar />
    </main>
  </div>
);

export default MainLayout;