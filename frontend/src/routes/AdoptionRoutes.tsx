
import type { RouteObject } from "react-router-dom";
import { lazy } from 'react';

import Loadable from "../components/third-patry/Loadable";

import PublicLayout from "../layout/PublicLayout"; // Component ที่ใช้สำหรับ Layout ของหน้านี้ 
const AdoptionPage = Loadable(lazy(() => import("../pages/public/adoption/homepage")));
const Doglist = Loadable(lazy(() => import("../pages/public/adoption/doglist")));
const AdoptionFormPage = Loadable(lazy(() => import("../pages/public/adoption/adoptfrom")));

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
        {          path: 'from/:dogId',
            element: <AdoptionFormPage />
        },]
};
};

export default AdoptionRoutes;