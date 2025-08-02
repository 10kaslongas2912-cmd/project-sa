
import { lazy } from 'react';
import type { RouteObject } from "react-router-dom";
import DonateLayout from "../layout/DonateLayout"; // Component ที่ใช้สำหรับ Layout ของหน้านี้ 
import DonationMoneyForm from "../pages/donate/DonationMoney";
import DonationConfirmationPage from "../pages/donate/DonationConfirmationPage";
import Loadable from "../components/third-patry/Loadable";

const DonationOptionsPage = Loadable(lazy(() => import("../pages/donate/DonationOptionsPage")));
const InformationDonorsPage = Loadable(lazy(() => import("../pages/donate/InformationDonors")));
const DonatePage = Loadable(lazy(() => import("../pages/donate")));
const DonateRoutes = (): RouteObject => {
  return {
    path: 'donate', 
    element: <DonateLayout />, 
    children: [
        {
            index: true,
            element: < DonatePage/>
        },
        {
            path: "options",
            element: <DonationOptionsPage/>,
        },

        {
            path: "donors-info",
            element: <InformationDonorsPage />,
        },
        
        {
            path: "money",
            element: <DonationMoneyForm />,
        },

        {
            path: "confirmation",
            element: <DonationConfirmationPage />,
        },
    ]
  };
};

export default DonateRoutes;