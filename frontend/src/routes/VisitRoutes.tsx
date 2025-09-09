import type { RouteObject } from "react-router-dom";
import { lazy } from 'react';
import Loadable from "../components/third-patry/Loadable";

import PublicLayout from "../layout/PublicLayout"; // Component ที่ใช้สำหรับ Layout ของหน้านี้
const CreateVisit = Loadable(lazy(() => import("../pages/dashboard/visit/createVisit")));
const UpdateVisit = Loadable(lazy(() => import("../pages/dashboard/visit/updateVisit")));

const VisitRoutes = (): RouteObject => {
return {
    path: '/',
    element: <PublicLayout />,
    children: [
        {
            path: 'create-visit',
            element: <CreateVisit />
        },
        {
            path: 'update-visit',
            element: <UpdateVisit />
        },
        
        
        

    ]
    
};
}
export default VisitRoutes;