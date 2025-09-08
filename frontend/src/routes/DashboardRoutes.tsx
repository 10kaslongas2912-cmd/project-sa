import type { RouteObject } from "react-router-dom";
import { lazy } from "react";
import Loadable from "../components/third-patry/Loadable";
const DashboardLayout = Loadable(lazy(() => import("../layout/DashboardLayout"))); // Placeholder for the dashboard home component
const DashboardTestPage = Loadable(lazy(() => import("../pages/dashboard/test")));
const Overview = Loadable(lazy(() => import("../pages/dashboard/Overview"))); // Placeholder for the overview component
const Dogs = Loadable(lazy(() => import("../pages/dashboard/Dogs"))); // Placeholder for the dogs component
const AdoptionRequests = Loadable(lazy(() => import("../pages/dashboard/Adoption/Requests"))); // Placeholder for adoption requests component
const AdoptionMatches = Loadable(lazy(() => import("../pages/dashboard/Adoption/Matches"))); // Placeholder for adoption matches component
export const dashboardRoutes: RouteObject = {
  path: "dashboard",
  element: <DashboardLayout />,
  children: [
    { index: true, element: <Overview /> },
    { path: "dogs", element: <Dogs /> },
    {
      path: "adoption",
      children: [
        { path: "requests", element: <AdoptionRequests /> },
        { path: "matches",  element: <AdoptionMatches />  },
      ],
    },
  ],
};

export const dashboardTestRoute1: RouteObject = {
  path: "dashboard-test1",
  element: <DashboardTestPage />,
};



export default [dashboardRoutes, dashboardTestRoute1] as RouteObject[];
