import React from "react";
import HeaderBar from "../../components/HeaderBar";
import SlideBar from "../../components/SlideBar";
import "./style.css"; // สไตล์สำหรับ layout
import { Outlet } from "react-router-dom"; // ใช้สำหรับ render sub-routes
const DashboardLayout: React.FC = () => {
  return (
        <div className="dashboard-grid">
      <header className="header"><HeaderBar /></header>
      <aside className="sidebar"><SlideBar /></aside>
      <main className="content"><Outlet /></main>
    </div>
  );
};

export default DashboardLayout;
