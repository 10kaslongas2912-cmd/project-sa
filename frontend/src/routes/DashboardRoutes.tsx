import type { RouteObject } from "react-router-dom";
import { lazy } from "react";
import Loadable from "../components/third-patry/Loadable";
const FormPageHealth = Loadable(lazy(() => import("../pages/public/HealthRecord/FormPage/index")));
const SingleDetailPageHealth = Loadable(lazy(() => import("../pages/public/HealthRecord/SingleDetailPage/index")));
const DetailPageHealth = Loadable(lazy(() => import('../pages/public/HealthRecord/DetailPage/index')));
const DashboardLayout = Loadable(lazy(() => import("../layout/DashboardLayout"))); // Placeholder for the dashboard home component
const DashboardTestPage = Loadable(lazy(() => import("../pages/dashboard/test")));
const Overview = Loadable(lazy(() => import("../pages/dashboard/Overview"))); // Placeholder for the overview component
const Dogs = Loadable(lazy(() => import("../pages/dashboard/Dogs"))); // Placeholder for the dogs component
const AdoptionPages = Loadable(lazy(() => import("../pages/public/adoption/adminadoption"))); // Placeholder for the users component
const HealthRecords = Loadable(lazy(() => import("../pages/public/HealthRecord/SearchPage"))); // Placeholder for the health records component
const CreateVisit = Loadable(lazy(() => import("../pages/dashboard/visit/createVisit")));
const UpdateVisit = Loadable(lazy(() => import("../pages/dashboard/visit/updateVisit")));
const ZoneCageManagementPage = Loadable(lazy(() => import("../pages/dashboard/ZoneCageManagement")));
const Volunteer = Loadable(lazy(() => import("../pages/dashboard/Volunteer")));
/// ==============================|| DASHBOARD ROUTING ||============================== //
const DonationStaff = Loadable(lazy(() => import("../pages/dashboard/Donation/index")));
// ==============================|| DASHBOARD ROUTING ||============================== //
export const dashboardRoutes: RouteObject = {
  path: "dashboard",
  element: <DashboardLayout />,
  children: [
    {
      index: true,
      element: <Overview />
    },
    {
      path: "dogs",
      element: <Dogs />
    },
    {
      path: "adoptions",
      element: <AdoptionPages />
    },
    {
      path: "health-record",
      children: [
        {
          index: true,
          element: <HealthRecords />,
        },
        {
          path: "dog/:id",
          element: <DetailPageHealth />
        },
        {
          path: ":id/add",
          element: <FormPageHealth />
        },
        {
          path: "record/:recordId",
          element: <SingleDetailPageHealth />
        },
      ]
    },
    {
        path: 'create-visit',
        element: <CreateVisit />
    },
    {
        path: 'update-visit',
        element: <UpdateVisit />
    },
    {
      path: "health-record/dog/:id",
      element: <DetailPageHealth />
    },
    {
      path: "health-record/:id/add",
      element: <FormPageHealth />
    },
    {
      path: "health-record/record/:recordId",
      element: <SingleDetailPageHealth />
    },
    {
      path: "zone-cage-management",
      element: <ZoneCageManagementPage />
    },
    {
      path: "volunteer",
      element: <Volunteer />
    },
    {
      path: "donation",
      element: <DonationStaff />
    }
  ]
};

export const dashboardTestRoute1: RouteObject = {
  path: "dashboard-test1",
  element: <DashboardTestPage />,
};


export default [dashboardRoutes, dashboardTestRoute1,] as RouteObject[];
