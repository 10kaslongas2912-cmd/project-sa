import type { RouteObject } from "react-router-dom";
import { lazy } from "react";
import Loadable from "../components/third-patry/Loadable";
const DashboardLayout = Loadable(lazy(() => import("../layout/DashboardLayout"))); // Placeholder for the dashboard home component
const DashboardTestPage = Loadable(lazy(() => import("../pages/dashboard/test")));
const Overview = Loadable(lazy(() => import("../pages/dashboard/Overview"))); // Placeholder for the overview component
const Dogs = Loadable(lazy(() => import("../pages/dashboard/Dogs"))); // Placeholder for the dogs component
const UseradoptionPages = Loadable(lazy(() => import("../pages/public/adoption/adminadoption"))); // Placeholder for the users component

// ==============================|| DASHBOARD ROUTING ||============================== //
export const dashboardRoutes: RouteObject = {
  path: "dashboard",
  element: <DashboardLayout />,
  children: [
    {
      index: true,
      element: <Overview />
    },
    {
      path: "dogs" ,
      element: <Dogs />
    },
    {
      path: "my-adoptions",
      element: <UseradoptionPages />
    }

  ],
};

export const dashboardTestRoute1: RouteObject = {
  path: "dashboard-test1",
  element: <DashboardTestPage />,
};


export default [dashboardRoutes, dashboardTestRoute1,] as RouteObject[];
