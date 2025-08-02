import { lazy } from "react";

import type { RouteObject } from "react-router-dom";



import AuthLayout from "../layout/AuthLayout";

import Loadable from "../components/third-patry/Loadable";




const LoginPages = Loadable(lazy(() => import("../pages/authentication/AuthPage")));

const LoginPages2 = Loadable(lazy(() => import("../pages/authentication/Login/index")))

const AuthRoutes = (): RouteObject => {

  return {

    path: "auth",
    element: <AuthLayout />,

    children: [
      {
        path: "login",
        element: <LoginPages />,
      },  
      {
        path: "signup",
        element: <LoginPages2 />,
      },

    ],

  };

};

export default AuthRoutes;