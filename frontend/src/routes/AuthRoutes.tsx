import { lazy } from "react";

import type { RouteObject } from "react-router-dom";

import Loadable from "../components/third-patry/Loadable";

const UserAuthPages = Loadable(
  lazy(() => import("../pages/authentication/AuthenUser"))
);
const StaffAuthPage = Loadable(lazy(() => import("../pages/authentication/AuthenStaff")))
const AuthRoutes = (): RouteObject => {
  return {
    path: "auth",
    children: [
      {
        path: "users",
        element: <UserAuthPages />,
      },
      {
        path: "staffs",
        element: <StaffAuthPage/>,
      },
    ],
  };
};

export default AuthRoutes;
