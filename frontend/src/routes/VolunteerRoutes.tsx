import type { RouteObject } from "react-router-dom";
import { lazy } from 'react';

import Loadable from "../components/third-patry/Loadable";
import FirstPage from "../pages/public/firstpage";

const VolunteerPage = Loadable(lazy(() => import("../pages/public/Volunteer")));

const VolunteerRoutes = (): RouteObject => {
  return {
    path: "/",
    children: [
      {
        index: true,
        element: <FirstPage />,
      },
      {
        path: "volunteer",
        element: <VolunteerPage />,
      },
    ],
  };
};

export default VolunteerRoutes;
