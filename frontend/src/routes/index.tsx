import { useRoutes } from "react-router-dom";
import PublicRoutes from "./PublicRoutes";
import AuthRoutes from "./AuthRoutes";
import  RouteObject  from "./DashboardRoutes"; 
import SponsorRoutes from "./SponsorRoutes";
import DonationRoutes from "./DonationRoutes";
import AdoptionRoutes from "./AdoptionRoutes";
import EventRoutes from "./EventRoutes";
import VisitRoutes from "./VisitRoutes";
import ManageRoutes from "./ManageRoutes";
import UserDashboardRoute from "./UserDashboardRouts";

// ==============================|| ROUTING RENDER ||============================== //

export default function ThemeRoutes() {
  return useRoutes([
    AuthRoutes(),
    PublicRoutes(),
    ...RouteObject,
    SponsorRoutes(),
    DonationRoutes(),
    AdoptionRoutes(),
    EventRoutes(),
    VisitRoutes(),
    ManageRoutes(),
    
    UserDashboardRoute(),
  ]);
}
