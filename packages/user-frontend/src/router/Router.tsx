import { createBrowserRouter } from "react-router-dom";
import GlobalErrorBoundary from "../errors/GlobalErrorBoundary";
import RootLayout from "../layouts/RootLayout";
import Home from "../pages/Home";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <GlobalErrorBoundary />,
    children: [
      {
        index: true,
        element: <Home />,
        // loader
      },
    ],
  },
]);
