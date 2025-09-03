import React from "react";
import HeaderBar from "../../components/HeaderBar";
import SlideBar from "../../components/SlideBar";
import "./style.css"; 
import { Outlet } from "react-router-dom"; 
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
