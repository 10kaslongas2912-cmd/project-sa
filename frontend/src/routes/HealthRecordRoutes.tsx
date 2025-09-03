import type { RouteObject } from "react-router-dom";
import { lazy } from "react";

import Loadable from "../components/third-patry/Loadable";

// ใช้ lazy + Loadable เพื่อโหลด component แบบแยกไฟล์ (code splitting)
const SearchPage = Loadable(lazy(() => import("../pages/public/HealthRecord/SearchPage/index")));
const DetailPage = Loadable(lazy(() => import("../pages/public/HealthRecord/DetailPage/index")));
const FormPage = Loadable(lazy(() => import("../pages/public/HealthRecord/FormPage/index")));
const SingleDetailPage = Loadable(lazy(() => import("../pages/public/HealthRecord/SingleDetailPage/index")));

const HealthRecordRoutes = (): RouteObject => {
  return {
    path: "search",
    children: [
      {
        index: true,
        element: <SearchPage />,
      },
      {
        path: "dog/:dogId",
        element: <DetailPage />,
      },
      {
        path: "dog/:dogId/add",
        element: <FormPage />,
      },
      {
        path: "record/:recordId",
        element: <SingleDetailPage />,
      },
    ],
  };
};

export default HealthRecordRoutes;
