
import { lazy } from 'react';
import type { RouteObject } from "react-router-dom";
import DonateLayout from "../layout/DonateLayout"; // Component ที่ใช้สำหรับ Layout ของหน้านี้ 
import DonationMoneyForm from "../pages/public/donate/DonationMoney";
import DonationConfirmationPage from "../pages/public/donate/DonationConfirmationPage";
import Loadable from "../components/third-patry/Loadable";

const DonationOptionsPage = Loadable(lazy(() => import("../pages/public/donate/DonationOptionsPage")));
const InformationDonorsPage = Loadable(lazy(() => import("../pages/public/donate/InformationDonors")));
const DonatePage = Loadable(lazy(() => import("../pages/public/donate")));
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