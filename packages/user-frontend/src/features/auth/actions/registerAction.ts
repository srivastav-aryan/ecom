import { fetchClient } from "@/http/fetchClient";
import {
  userRegistrationSchema, 
  type userRegistrationInput,
} from "@e-com/shared/schemas";
import type { FieldErrors, ActionResponse } from "@e-com/shared/types";
import { redirect, type ActionFunctionArgs, type ActionFunction } from "react-router-dom";

export default async function registerAction({
  request
}: ActionFunctionArgs): Promise<ActionResponse | ReturnType<ActionFunction>> {
  const formData = await request.formData();
  
  const rawData: userRegistrationInput = {
    firstname: formData.get("firstName") as string,
    lastname: formData.get("lastName") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const url = new URL(request.url);
  const redirectTo = url.searchParams.get("redirectTo") || "/";

  const result = userRegistrationSchema.safeParse({ body: rawData });

  if (!result.success) {
    const errors: FieldErrors = {};
    for (const issue of result.error.issues) {
      const path = issue.path[1] as keyof FieldErrors;
      if (path && !errors[path]) {
        const fieldMap: Record<string, keyof FieldErrors> = {
          firstname: "firstName",
          lastname: "lastName",
        };
        const formField = fieldMap[path] || path;
        errors[formField as keyof FieldErrors] = issue.message;
      }
    }
    return { errors };
  }

  try {
    await fetchClient("/auth/register", {
      method: "POST",
      body: result.data.body,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Registration failed";
    return { serverError: message };
  }

  return redirect(redirectTo);
}
