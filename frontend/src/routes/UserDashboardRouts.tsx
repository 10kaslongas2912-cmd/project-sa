import type { RouteObject } from "react-router-dom";
import { lazy } from "react";

import Loadable from "../components/third-patry/Loadable";

const UserDashboardPage = Loadable(
  lazy(() => import("../pages/userDashboard/index"))
);

const UserDashboardRoute = (): RouteObject => {
  return {
    path: "user-dashboard",
    element: <UserDashboardPage />,
  };
};

export default UserDashboardRoute;
