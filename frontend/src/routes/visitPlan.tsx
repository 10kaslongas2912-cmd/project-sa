import type { RouteObject } from "react-router-dom";
import { lazy } from 'react';
import Loadable from "../components/third-patry/Loadable";
import PublicLayout from "../layout/PublicLayout"; // Component ที่ใช้สำหรับ Layout ของหน้านี้ 

const VisitPlan = Loadable(lazy(() => import("../pages/public/visitPlan/visitPlan")));

const VisitPlanRoutes = (): RouteObject => {
  return {
    path: 'visitplan',
    element: <PublicLayout />,
    children: [
        {
            index: true,
            element: <VisitPlan />
        },
        
    ]
  };
};

export default VisitPlanRoutes;