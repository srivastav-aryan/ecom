import { setupWorker } from "msw/browser";
import { navHandlers } from "./handler/nav-handler";

export const worker = setupWorker(...navHandlers);
