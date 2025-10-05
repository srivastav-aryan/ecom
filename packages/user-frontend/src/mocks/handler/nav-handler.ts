import {http, HttpResponse} from "msw"
import { mockNaviData } from "../data/navigationMocks"

export const navHandlers = [
    http.get("/api/nav", () => {
        return HttpResponse.json(mockNaviData)
    } )    
]