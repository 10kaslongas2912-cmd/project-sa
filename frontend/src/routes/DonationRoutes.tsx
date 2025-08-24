
import type { RouteObject } from "react-router-dom";
import { lazy } from 'react';

import Loadable from "../components/third-patry/Loadable";

const DonationOptionsPage = Loadable(lazy(() => import("../pages/public/donation/DonationOptionsPage")));
const DonatePage = Loadable(lazy(() => import("../pages/public/donation/donate")));
const DonationItemPage = Loadable(lazy(() => import("../pages/public/donation/DonationItem")));
const DonationMoneyPage = Loadable(lazy(() => import("../pages/public/donation/DonationMoney/index")));
const InformationDonorsPage = Loadable(lazy(() => import("../pages/public/donation/InformationDonors/index")));
const ItemSummaryPage = Loadable(lazy(() => import("../pages/public/donation/ItemSumaryPage")));
const CreditCardPaymentPage = Loadable(lazy(() => import("../pages/public/donation/creditCardPayment")));
const ScanBankPage = Loadable(lazy(() => import("../pages/public/donation/scanBank/mobileBanking")));
const ThankYouPage = Loadable(lazy(() => import("../pages/public/donation/thankPage")));

const DonationRoutes = (): RouteObject => {
  return {
    path: 'donation',
    children: [
        {
            index: true,
            element: <DonatePage />
        },
        {
            path: 'options',
            element: <DonationOptionsPage />
        },
        {
            path: 'item',
            element: <DonationItemPage />
        },
        {
            path: 'money',
            element: <DonationMoneyPage />
        },
        {
            path: 'information',
            element: <InformationDonorsPage />
        },
        {
            path: 'summary',
            element: <ItemSummaryPage />
        },
        {
            path: 'payment/creditcard',
            element: <CreditCardPaymentPage />
        },
        {
            path: 'payment/banktransfer',
            element: <ScanBankPage />
        },
        {
            path: 'thankyou',
            element: <ThankYouPage />
        }
    ]
  };
};

export default DonationRoutes;
