import type { RouteObject } from "react-router-dom";
import { lazy } from "react";
import Loadable from "../components/third-patry/Loadable";
const DashboardLayout = Loadable(lazy(() => import("../layout/DashboardLayout"))); // Placeholder for the dashboard home component
const Overview = Loadable(lazy(() => import("../pages/private/Overview"))); // Placeholder for the overview component
const Dogs = Loadable(lazy(() => import("../pages/private/Dogs"))); // Placeholder for the dogs component
const AdoptionRequests = Loadable(lazy(() => import("../pages/private/Adoption/Requests"))); // Placeholder for adoption requests component
const AdoptionMatches = Loadable(lazy(() => import("../pages/private/Adoption/Matches"))); // Placeholder for adoption matches component
const DashboardRoutes = (): RouteObject => {
    return {
        path: 'dashboard',
        element: <DashboardLayout />,
        children: [
            {
                index: true,
                element: <Overview />, // Default route for the dashboard
            },
            {
                path: 'dogs',
                element: <Dogs />, // Route for the dogs page
            },
            {
                path: 'adoption',
                children: [
                    {
                        path: 'requests',
                        element: <AdoptionRequests />, // Route for adoption requests
                    },
                    {
                        path: 'matches',
                        element: <AdoptionMatches />, // Route for adoption matches
                    }
                        ]
            },
      ]
    };
};
export default DashboardRoutes;