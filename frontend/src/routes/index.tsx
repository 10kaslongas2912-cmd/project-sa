import { useRoutes } from "react-router-dom";

import PublicRoutes from "./PublicRoutes";
import AuthRoutes from "./AuthRoutes";
import  RouteObject  from "./DashboardRoutes"; 
import SponsorRoutes from "./SponsorRoutes";
import DonationRoutes from "./DonationRoutes";
import HealthRecordRoutes from "./HealthRecordRoutes";
import AdoptionRoutes from "./AdoptionRoutes";
import EventRoutes from "./EventRoutes";
import { userDashboardRoutes } from "./UserDashboard";
import VisitRoutes from "./VisitRoutes";

// ==============================|| ROUTING RENDER ||============================== //

export default function ThemeRoutes() {
  return useRoutes([
    AuthRoutes(),
    PublicRoutes(),
    ...RouteObject,
    SponsorRoutes(),
    DonationRoutes(),
    HealthRecordRoutes(),
    AdoptionRoutes(),
    EventRoutes(),
    userDashboardRoutes,
    VisitRoutes(),
    
  ]);
}
