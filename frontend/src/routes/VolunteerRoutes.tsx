import type { RouteObject } from "react-router-dom";
import { lazy } from 'react';

import Loadable from "../components/third-patry/Loadable";
import FirstPage from "../pages/public/firstpage";

const VolunteerPage = Loadable(lazy(() => import("../pages/public/Volunteer/volunteerRegister")));
const ZoneCageManagementPage = Loadable(lazy(() => import("../pages/ZoneCageManagement")));
const VolunteerApprovalPage = Loadable(lazy(() => import("../pages/public/Volunteer/volunteerApproval")));
const VolunteerWaitForApprove = Loadable(lazy(() => import("../pages/public/Volunteer/volunteerWaitForApprove")));

const VolunteerRoutes = (): RouteObject => {
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
      {
        path: "volunteer",
        element: <VolunteerPage />,
      },
      {
        path: "volunteer-approval",
        element: <VolunteerApprovalPage />,
      },
      {
        path: "volunteer-wait-for-approve",
        element: <VolunteerWaitForApprove />,
      }
    ],
  };
};

export default VolunteerRoutes;
