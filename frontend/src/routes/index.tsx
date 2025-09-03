import { useRoutes } from "react-router-dom";

import PublicRoutes from "./PublicRoutes";
import AuthRoutes from "./AuthRoutes";
import DashboardRoutes from "./DashboardRoutes";
import SponsorRoutes from "./SponsorRoutes";
import DonationRoutes from "./DonationRoutes";
import VisitPlanRoutes from "./visitPlan";

// ==============================|| ROUTING RENDER ||============================== //

export default function ThemeRoutes() {
  return useRoutes([
    AuthRoutes(),
    PublicRoutes(),
    DashboardRoutes(),
    SponsorRoutes(),
    DonationRoutes(),
    VisitPlanRoutes(),
  ]);
}