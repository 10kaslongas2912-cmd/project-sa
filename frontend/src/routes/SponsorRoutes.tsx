
import type { RouteObject } from "react-router-dom";
import { lazy } from 'react';

import Loadable from "../components/third-patry/Loadable";

import PublicLayout from "../layout/PublicLayout"; // Component ที่ใช้สำหรับ Layout ของหน้านี้ 
const SponsorPage = Loadable(lazy(() => import("../pages/public/sponsor")));
const SponsorRoutes = (): RouteObject => {
  return {
    path: 'sponsor', 
    element: <PublicLayout />, 
    children: [
        {
            index: true,
            element: <SponsorPage />
        },
    ]
  };
};

export default SponsorRoutes;