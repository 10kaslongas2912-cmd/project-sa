import type { RouteObject } from "react-router-dom";
import { lazy } from 'react';
import Loadable from "../components/third-patry/Loadable";

import PublicLayout from "../layout/PublicLayout"; // Component ที่ใช้สำหรับ Layout ของหน้านี้
const Visit = Loadable(lazy(() => import("../pages/dashboard/visit/createVisit")));

const VisitRoutes = (): RouteObject => {
return {
    path: 'visit',
    element: <PublicLayout />,
    children: [
        {
            index: true,
            element: <Visit />
        },
    ]
    
};
}
export default VisitRoutes;