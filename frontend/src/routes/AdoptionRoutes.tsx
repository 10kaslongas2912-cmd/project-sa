
import type { RouteObject } from "react-router-dom";
import { lazy } from 'react';

import Loadable from "../components/third-patry/Loadable";

import PublicLayout from "../layout/PublicLayout"; // Component ที่ใช้สำหรับ Layout ของหน้านี้ 
const AdoptionPage = Loadable(lazy(() => import("../pages/public/adoption/homepage")));
const Doglist = Loadable(lazy(() => import("../pages/public/adoption/doglist")));
const SponsorAmountPage = Loadable(lazy(() => import("../pages/public/sponsor/sponsoramount")));
const SponsorFormPage = Loadable(lazy(() => import("../pages/public/sponsor/sponsorform")));

const AdoptionRoutes = (): RouteObject => {
return {
    path: 'adoption', 
    element: <PublicLayout />, 
    children: [
        {
            index: true,
            element: <AdoptionPage />
        },
        {
            path: 'doglist/:id',
            element: <Doglist />
        },
        {
            path: 'amount',
            element: <SponsorAmountPage />
        },
        {
            path: 'form',
            element: <SponsorFormPage />
        },
    
    ]
};
};

export default AdoptionRoutes;