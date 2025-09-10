import type { RouteObject } from "react-router-dom";
import { lazy } from 'react';
import Loadable from "../components/third-patry/Loadable";

import PublicLayout from "../layout/PublicLayout"; // Component ที่ใช้สำหรับ Layout ของหน้านี้
const Manage = Loadable(lazy(() => import("../pages/dashboard/manage")));

const ManageRoutes = (): RouteObject => {
    return {
        path: '/',
        element: <PublicLayout />,
        children: [
            {
                path: 'manage',
                element: <Manage />
            },
        ]
    }
}
export default ManageRoutes;