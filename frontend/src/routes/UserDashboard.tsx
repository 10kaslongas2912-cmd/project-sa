import type { RouteObject } from "react-router-dom";
import { lazy } from "react";

import Loadable from "../components/third-patry/Loadable";
import UserDashboard from "../pages/userDashboard";

// ใช้ lazy + Loadable เพื่อโหลด component แบบแยกไฟล์ (code splitting)
const UserDashboardPage = Loadable(lazy(() => import("../pages/userDashboard/index")));

export const userDashboardRoutes: RouteObject = {
    path: "userDashboard",
    element: <UserDashboardPage />,
};