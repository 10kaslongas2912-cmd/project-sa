
import type { RouteObject } from "react-router-dom";
import { lazy } from 'react';
import Loadable from "../components/third-patry/Loadable";
import PublicLayout from "../layout/PublicLayout"; // Component ที่ใช้สำหรับ Layout ของหน้านี้ 
const EventPage = Loadable(lazy(() => import("../pages/public/event/eventdisplay"))); //หน้า Event

const EventRoutes = (): RouteObject => {
return {
    path: 'event', 
    element: <PublicLayout />, 
    children: [
        {
            index: true,
            element: <EventPage/>
        },
        ]
};
};

export default EventRoutes;