import { createBrowserRouter } from "react-router-dom";
import GlobalErrorBoundary from "../errors/GlobalErrorBoundary";
import RootLayout from "../layouts/RootLayout";
import Home from "../pages/Home";
import { rootLoader } from "@/loaders/rootLoader";



// Backend nav makes sense ONLY when:
// permissions decide visibility
// navigation is content (CMS)
// multiple clients consume same nav
// which is not true in this case so no need for loaders but added for learning purpose


export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <GlobalErrorBoundary />,
    loader: rootLoader,
    children: [
      {
        index: true,
        element: <Home />,
      },
    ],
  },
]);
