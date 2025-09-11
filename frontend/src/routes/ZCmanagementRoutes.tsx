import type { RouteObject } from "react-router-dom";
import { lazy } from 'react';

import Loadable from "../components/third-patry/Loadable";
import FirstPage from "../pages/public/firstpage";
const ZoneCageManagementPage = Loadable(lazy(() => import("../pages/dashboard/ZoneCageManagement")));

const ZCmanagementRoutes = (): RouteObject => {
  return {
    path: "/",
    children: [
      {
        index: true,
        element: <FirstPage />,
      },
      {
        path: "zone-cage-management",
        element: <ZoneCageManagementPage />,
      },
    ],
  };
};

export default ZCmanagementRoutes;