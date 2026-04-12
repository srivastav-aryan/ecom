import { fetchClient, setAccessToken } from "@/http/fetchClient";
import {
  userLoginSchema, 
  type userLoginInput
} from "@e-com/shared/schemas";
import type { ActionResponse } from "@e-com/shared/types";
import { redirect, type ActionFunctionArgs, type ActionFunction } from "react-router-dom";

export default async function loginAction({
  request
}: ActionFunctionArgs): Promise<ActionResponse | ReturnType<ActionFunction>> {
  const formData = await request.formData();
  
  const rawData: userLoginInput = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const url = new URL(request.url);
  const redirectTo = url.searchParams.get("redirectTo") || "/";

  const result = userLoginSchema.safeParse({ body: rawData });

  if (!result.success) {
    const errors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const path = issue.path[1] as string;
      if (path && !errors[path]) {
        errors[path] = issue.message;
      }
    }
    return { errors };
  }

  try {
    const response = await fetchClient("/auth/login", {
      method: "POST",
      body: result.data.body,
    });

    const { accessToken } = response.data;
    setAccessToken(accessToken);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Invalid email or password";
    return { serverError: message };
  }

  return redirect(redirectTo);
}
