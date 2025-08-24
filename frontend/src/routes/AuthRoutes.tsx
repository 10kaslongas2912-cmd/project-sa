import { lazy } from "react";

import type { RouteObject } from "react-router-dom";

import Loadable from "../components/third-patry/Loadable";

const LoginPages = Loadable(lazy(() => import("../pages/authentication/AuthPage")));

const AuthRoutes = (): RouteObject => {

  return {

    path: "auth",
    element: <LoginPages />,
  };

};

export default AuthRoutes;