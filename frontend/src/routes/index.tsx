import { useRoutes, type RouteObject } from "react-router-dom";

import PublicRoutes from "./PublicRoutes";
import AuthRoutes from "./AuthRoutes";
import DashboardRoutes from "./DashboardRoutes";
import DonateRoutes from "./DonateRoutes";


function ConfigRoutes() {

  const allRoutes: RouteObject[] = [

    PublicRoutes(),
    AuthRoutes(),
    DashboardRoutes(),
    DonateRoutes(),
  ];

  return useRoutes(allRoutes);
}

export default ConfigRoutes;