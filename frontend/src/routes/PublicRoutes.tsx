import type { RouteObject } from "react-router-dom";
import { lazy } from "react";

import Loadable from "../components/third-patry/Loadable";

import PublicLayout from "../layout/PublicLayout";

const MainPages = Loadable(lazy(() => import("../pages/public/firstpage")));

const PublicRoutes = (): RouteObject => {
    return {

        path: "/",
        
            element: <PublicLayout />,
        
            children: [
                {
                    index: true,    
                    element: <MainPages/>,
                },
            ],
    };
};

export default PublicRoutes;