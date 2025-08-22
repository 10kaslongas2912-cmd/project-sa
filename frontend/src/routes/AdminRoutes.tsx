import { lazy } from "react";
import type { RouteObject } from "react-router-dom";
import Loadable from "../components/third-patry/Loadable";
import FullLayout from "../layout/FullLayout"; // FullLayout ที่ถูกปรับปรุงแล้ว
import AnimatedPage from "../components/AnimatedPage";

const MainPages = Loadable(lazy(() => import("../pages/authentication/Login")));

// นำเข้าคอมโพเนนต์ที่นี่ เพราะ AdminRoutes จะกำหนด element ให้ children
const Dashboard = Loadable(lazy(() => import("../pages/private")));
const Customer = Loadable(lazy(() => import("../pages/customer")));
const CreateCustomer = Loadable(lazy(() => import("../pages/customer/create")));
const EditCustomer = Loadable(lazy(() => import("../pages/customer/edit")));


const AdminRoutes = (isLoggedIn: boolean): RouteObject => {
  return {
    path: "/",
    // ถ้า Login แล้ว ใช้ FullLayout เป็น Shell (ซึ่งจะมี Outlet ข้างใน)
    // ถ้ายังไม่ Login ให้ไปหน้า Login
    element: isLoggedIn ? <FullLayout /> : <MainPages />,
    children: [
      // <<<--- child routes เหล่านี้จะถูก Render ใน <Outlet /> ของ FullLayout ---<<<
  {
    path: "/", // เส้นทางเริ่มต้นเมื่อ Login แล้ว (เช่น /dashboard)
    element: <AnimatedPage><Dashboard /></AnimatedPage>,
  },
  {
    path: "/customer", // เส้นทาง /customer โดยตรง (สำหรับหน้า Customer List)
    element: <AnimatedPage><Customer /></AnimatedPage>,
  },
  {
    path: "/customer/create", // เส้นทาง /customer/create
    element: <AnimatedPage><CreateCustomer /></AnimatedPage>,
  },
  {
    path: "/customer/edit/:id", // เส้นทาง /customer/edit/:id
    element: <AnimatedPage><EditCustomer /></AnimatedPage>,
  },
  // สามารถเพิ่มเส้นทางย่อยอื่นๆ ที่จะอยู่ภายใต้ FullLayout ได้ที่นี่
    ],
  };
};

export default AdminRoutes;