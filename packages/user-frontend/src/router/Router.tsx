import { createBrowserRouter } from "react-router-dom";
import { Suspense, lazy } from "react";
import GlobalErrorBoundary from "../errors/GlobalErrorBoundary";
import RootLayout from "../layouts/RootLayout";
import { rootLoader } from "./loaders/rootLoader";
import registerAction from "@/features/auth/actions/registerAction";
import loginAction from "@/features/auth/actions/loginAction";

import Home from "../pages/Home";
const RegisterPage = lazy(() => import("@/pages/auth/RegisterPage"));
const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));

const PageLoader = () => (
  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
    Loading...
  </div>
);



// Backend nav makes sense ONLY when:
// permissions decide visibility
// navigation is content (CMS)
// multiple clients consume same nav
// which is not true in this case so no need for loaders but added for learning purpose


export const router = createBrowserRouter([
  {
    id: "root",
    path: "/",
    element: <RootLayout />,
    errorElement: <GlobalErrorBoundary />,
    loader: rootLoader,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
       path: "auth",
       children: [
        {
          path: "register",
          element: <Suspense fallback={<PageLoader />}><RegisterPage /></Suspense>,
          action: registerAction
        },
        {
          path: "login",
          element: <Suspense fallback={<PageLoader />}><LoginPage /></Suspense>,
          action: loginAction
        }
       ]
      }
    ],
  },
]);
