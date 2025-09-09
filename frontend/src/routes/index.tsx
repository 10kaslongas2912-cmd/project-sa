import { useRoutes } from "react-router-dom";

import PublicRoutes from "./PublicRoutes";
import AuthRoutes from "./AuthRoutes";
import { dashboardRoutes, dashboardTestRoute1} from "./DashboardRoutes"; 
import SponsorRoutes from "./SponsorRoutes";
import DonationRoutes from "./DonationRoutes";
import HealthRecordRoutes from "./HealthRecordRoutes";
import AdoptionRoutes from "./AdoptionRoutes";
import EventRoutes from "./EventRoutes";
import { userDashboardRoutes } from "./UserDashboard";
import VisitRoutes from "./VisitRoutes";
import ManageRoutes from "./ManageRoutes";

// ==============================|| ROUTING RENDER ||============================== //

export default function ThemeRoutes() {
  return useRoutes([
    AuthRoutes(),
    PublicRoutes(),
    dashboardRoutes,
    dashboardTestRoute1,
    SponsorRoutes(),
    DonationRoutes(),
    HealthRecordRoutes(),
    AdoptionRoutes(),
    EventRoutes(),
    userDashboardRoutes,
    VisitRoutes(),
    ManageRoutes(),
    
  ]);
}
