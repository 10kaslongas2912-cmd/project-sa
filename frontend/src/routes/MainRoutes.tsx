import { lazy } from "react";

import type { RouteObject } from "react-router-dom";

import MinimalLayout from "../layout/MinimalLayout";

import Loadable from "../components/third-patry/Loadable";



const Registerages = Loadable(lazy(() => import("../pages/authentication/Register")));

const LoginPages = Loadable(lazy(() => import("../pages/authentication/Login")));

import AnimatedPage from "../components/AnimatedPage";

const DonatePage = Loadable(lazy(() => import("../pages/donation/donate")));
const FirstPage = Loadable(lazy(() => import("../pages/firstpage/index")));
const DonationOptionsPage = Loadable(lazy(() => import("../pages/donation/DonationOptionsPage")));
const InformationDonorsPage = Loadable(lazy(() => import("../pages/donation/InformationDonors")));
const DonationMoneyPage = Loadable(lazy(() => import("../pages/donation/DonationMoney"))); // เปลี่ยนตรงนี้
const CreditCardPaymentPage = Loadable(lazy(() => import("../pages/donation/creditCardPayment"))); // เปลี่ยนตรงนี้
const ThankYouPage = Loadable(lazy(() => import("../pages/donation/thankPage")));
const MobileBankingPage = Loadable(lazy(() => import("../pages/donation/scanBank/mobileBanking"))); // เปลี่ยนตรงนี้
const DonationItemPage = Loadable(lazy(() => import("../pages/donation/DonationItem")));
const ItemSummaryPage = Loadable(lazy(() => import("../pages/donation/ItemSumaryPage")));
const DogHealthRecordPage = Loadable(lazy(() => import("../pages/RecordHealt/DogHealthRecordPage/DogHealthRecordPage")))
const VolunteerPage = Loadable(lazy(() => import("../pages/Volunteer/index"))); // เปลี่ยนตรงนี้
const ZoneCageManagementPage = Loadable(lazy(() => import("../pages/ZoneCageManagement/index"))); // เปลี่ยนตรงนี้

const MainRoutes = (): RouteObject => { 

  return {

    path: "/",

    element: <MinimalLayout />,

    children: [

      {

        path: "/",

        element: <AnimatedPage><FirstPage /></AnimatedPage>,

      },

      {

        path: "/signup",

        element: <AnimatedPage><Registerages /></AnimatedPage>,

      },
      {

        path: "/login",

        element: <AnimatedPage><LoginPages /></AnimatedPage>,

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
        element: <AnimatedPage><ItemSummaryPage /></AnimatedPage>,
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