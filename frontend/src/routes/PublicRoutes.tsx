import type { RouteObject } from "react-router-dom";
import { lazy } from "react";


import Loadable from "../components/third-patry/Loadable";

import MainLayout from "../layout/MainLayout";

const MainPages = Loadable(lazy(() => import("../pages/public/firstpage")));


const PublicRoutes = (): RouteObject => {
    return {

        path: "/",
        
            element: <MainLayout />,
        
            children: [
                {
                    index: true,    
                    element: <MainPages/>,
                },
    
            ],
    };
};

export default PublicRoutes;