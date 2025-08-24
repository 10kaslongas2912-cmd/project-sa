
import type { RouteObject } from "react-router-dom";
import { lazy } from 'react';

import Loadable from "../components/third-patry/Loadable";

import PublicLayout from "../layout/PublicLayout"; // Component ที่ใช้สำหรับ Layout ของหน้านี้ 
const SponsorPage = Loadable(lazy(() => import("../pages/public/sponsor/mainpage")));
const DogInfoPage = Loadable(lazy(() => import("../pages/public/sponsor/doginfo")));
const SponsorAmountPage = Loadable(lazy(() => import("../pages/public/sponsor/sponsoramount")));
const SponsorFormPage = Loadable(lazy(() => import("../pages/public/sponsor/sponsorform")));
const SponsorPaymentPage = Loadable(lazy(() => import("../pages/public/sponsor/sponsorpayment")));
const SponsorThankyouPage = Loadable(lazy(() => import("../pages/public/sponsor/sponsorthankyou")));
const SponsorPaymentCreditCardPage = Loadable(lazy(() => import("../components/Payment/Creditcard")));
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
            children: [
                {
                    index: true,
                    element: <SponsorPaymentPage />
                },
                {
                    path: 'creditcard',
                    element: <SponsorPaymentCreditCardPage />,
                },
                {
                    path: 'banktransfer',
                    element: <SponsorPaymentPage />,
                },
                {
                    path: 'promptpay',
                    element: <SponsorPaymentPage />,
                },
                {
                    path: 'thankyou',
                    element: <SponsorThankyouPage />
                },  
            ]
        },
    ]
  };
};

export default SponsorRoutes;