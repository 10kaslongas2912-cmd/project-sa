import { lazy } from "react";

import type { RouteObject } from "react-router-dom";

import Loadable from "../components/third-patry/Loadable";

import AnimatedPage from "../components/AnimatedPage";

const DonatePage = Loadable(lazy(() => import("../pages/public/donation/donate/index")));
const FirstPage = Loadable(lazy(() => import("../pages/public/firstpage/index")));
const DonationOptionsPage = Loadable(lazy(() => import("../pages/public/donation/DonationOptionsPage")));
const InformationDonorsPage = Loadable(lazy(() => import("../pages/public/donation/InformationDonors")));
const DonationMoneyPage = Loadable(lazy(() => import("../pages/public/donation/DonationMoney"))); // เปลี่ยนตรงนี้
const CreditCardPaymentPage = Loadable(lazy(() => import("../pages/public/donation/creditCardPayment"))); // เปลี่ยนตรงนี้
const ThankYouPage = Loadable(lazy(() => import("../pages/public/donation/thankPage")));
const MobileBankingPage = Loadable(lazy(() => import("../pages/public/donation/scanBank/mobileBanking"))); // เปลี่ยนตรงนี้
const DonationItemPage = Loadable(lazy(() => import("../pages/public/donation/DonationItem")));
const DonationSummaryPage = Loadable(lazy(() => import("../pages/public/donation/ItemSumaryPage")));
const VolunteerPage = Loadable(lazy(() => import("../pages/Volunteer/index"))); // เปลี่ยนตรงนี้
const ZoneCageManagementPage = Loadable(lazy(() => import("../pages/ZoneCageManagement/index"))); // เปลี่ยนตรงนี้

const MainRoutes = (): RouteObject => { 

  return {

    path: "/",

      element: <FirstPage />,

    children: [

      {

        path: "/",

        element: <AnimatedPage><FirstPage /></AnimatedPage>,

      },

      {
        path: "/donate",
        element: <AnimatedPage><DonatePage /></AnimatedPage>,
      },
      {
        path: "/donate-options",
        element: <AnimatedPage><DonationOptionsPage /></AnimatedPage>,
      },
      {
        path: "/information-donors",
        element: <AnimatedPage><InformationDonorsPage /></AnimatedPage>,
      },

      {

        path: "/donation-money",

        element: <AnimatedPage><DonationMoneyPage /></AnimatedPage>,

      },
      {
        path: "/creditCardPayment",
        element: <AnimatedPage><CreditCardPaymentPage /></AnimatedPage>,
      },
      {
        path: "/thank-you",
        element: <AnimatedPage><ThankYouPage /></AnimatedPage>,
      },
      {
        path: "/mobile-banking",
        element: <AnimatedPage><MobileBankingPage /></AnimatedPage>,
      },
      {
        path: "/donation-item",
        element: <AnimatedPage><DonationItemPage /></AnimatedPage>,
      },
      {
        path: "/item-summary",
        element: <AnimatedPage><DonationSummaryPage /></AnimatedPage>,
      },
      {
        path: "/volunteer",
        element: <AnimatedPage><VolunteerPage /></AnimatedPage>,
      },
      {
        path: "/zone-cage-management",
        element: <AnimatedPage><ZoneCageManagementPage /></AnimatedPage>,
      }

    ],

  };

};


export default MainRoutes;