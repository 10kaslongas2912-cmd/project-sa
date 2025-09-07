import { useRoutes } from "react-router-dom";

import PublicRoutes from "./PublicRoutes";
import AuthRoutes from "./AuthRoutes";
import { dashboardRoutes, dashboardTestRoute } from "./DashboardRoutes"; 
import SponsorRoutes from "./SponsorRoutes";
import DonationRoutes from "./DonationRoutes";
import HealthRecordRoutes from "./HealthRecordRoutes";
import AdoptionRoutes from "./AdoptionRoutes";

// ==============================|| ROUTING RENDER ||============================== //

export default function ThemeRoutes() {
  return useRoutes([
    AuthRoutes(),
    PublicRoutes(),
    dashboardRoutes,
    dashboardTestRoute,
    SponsorRoutes(),
    DonationRoutes(),
    HealthRecordRoutes(),
    AdoptionRoutes(),
  ]);
}
