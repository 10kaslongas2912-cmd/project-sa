
import { lazy } from 'react';
import type { RouteObject } from "react-router-dom";


import DonationMoneyForm from "../pages/public/donate/DonationMoney";
import DonationConfirmationPage from "../pages/public/donate/DonationConfirmationPage";
import Loadable from "../components/third-patry/Loadable";

const DonationOptionsPage = Loadable(lazy(() => import("../pages/public/donate/DonationOptionsPage")));
const InformationDonorsPage = Loadable(lazy(() => import("../pages/public/donate/InformationDonors")));
const DonatePage = Loadable(lazy(() => import("../pages/public/donate")));


const DonateRoutes = (): RouteObject => {
  return {
    
  };
};

export default DonateRoutes;