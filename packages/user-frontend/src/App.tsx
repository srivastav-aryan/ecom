import { RouterProvider } from "react-router-dom";
import { router } from "./router/Router";
import { initMock } from "./mocks";

if (import.meta.env.DEV && import.meta.env.VITE_API_MODE === "mock") {
  await initMock();
}

function App() {
  return <RouterProvider router={router} />;
}

export default App;
