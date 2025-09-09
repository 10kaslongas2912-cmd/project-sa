import { lazy } from "react";

import type { RouteObject } from "react-router-dom";

import Loadable from "../components/third-patry/Loadable";

const UseradoptionPages = Loadable(lazy(() => import("../pages/public/adoption/useradopt")));

const UseradoptPages = (): RouteObject => {

  return {

    path: "my-adoptions",
    element: <UseradoptionPages />,
    
  };

};

export default UseradoptPages;