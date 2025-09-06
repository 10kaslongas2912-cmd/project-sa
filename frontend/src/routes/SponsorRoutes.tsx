
import type { RouteObject } from "react-router-dom";
import { lazy } from 'react';

import Loadable from "../components/third-patry/Loadable";

import PublicLayout from "../layout/PublicLayout"; // Component ที่ใช้สำหรับ Layout ของหน้านี้ 
import SponsorshipLayout from "../layout/PublicLayout/SponsorshipLayout"
const SponsorPage = Loadable(lazy(() => import("../pages/public/sponsor/mainpage")));
const DogInfoPage = Loadable(lazy(() => import("../pages/public/sponsor/doginfo")));
const SponsorAmountPage = Loadable(lazy(() => import("../pages/public/sponsor/SponsorAmount")));
const SponsorFormPage = Loadable(lazy(() => import("../pages/public/sponsor/SponsorForm")));
const SponsorPaymentPage = Loadable(lazy(() => import("../pages/public/sponsor/SponsorPayment")));
const SponsorThankyouPage = Loadable(lazy(() => import("../pages/public/sponsor/SponsorThankyou")));
const SponsorRoutes = (): RouteObject => {
  return {
    path: 'sponsor', 
    element: <PublicLayout />, 
    children: [
        {
            index: true,
            element: <SponsorPage />
        },
        {
            path: ':id',
            element: <SponsorshipLayout />,
            children: [
                {
                    path: 'dog-info',
                    element: <DogInfoPage />
                },
                
                {
                    path: 'amount',
                    element: <SponsorAmountPage />
                },
                {
                    path: 'form',
                    element: <SponsorFormPage />
                },
                {
                    path: 'payment',
                    element: <SponsorPaymentPage />
                },
                {
                    path: 'thank-you',
                    element: <SponsorThankyouPage />
                }
            ]
        },
    ]
  };
};

export default SponsorRoutes;