import { Form, useActionData, useNavigation, Link, useSearchParams } from "react-router-dom";
import { Field, FieldLabel, FieldError, FieldGroup } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/features/auth/components/PasswordInput";
import { Input } from "@/components/ui/input";
import type { ActionResponse } from "@e-com/shared/schemas";

export default function LoginPage() {
  const actionData = useActionData() as ActionResponse | undefined;
  const navigation = useNavigation();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/";

  const isSubmitting = navigation.state === "submitting";
  const errors = actionData?.errors;
  const serverError = actionData?.serverError;

  return (
    <div className="flex items-center justify-center bg-white py-12 px-6">
      <div className="w-full max-w-md space-y-8">
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-black">
            Sign In
          </h1>
          <p className="text-gray-600">
            Welcome back
          </p>
        </div>

        {serverError && (
          <div className="border-2 border-red-500 bg-red-50 p-4 text-red-700 font-medium">
            {serverError}
          </div>
        )}

        <div className="border-2 border-black">
          <Form method="post" className="p-6 space-y-6">
            <input type="hidden" name="redirectTo" value={redirectTo} />
            
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  className="rounded-none border-2 border-black focus:ring-0 focus:border-black"
                />
                {errors?.email && (
                  <FieldError>{errors.email}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <PasswordInput
                  id="password"
                  name="password"
                  placeholder="Enter password"
                  containerClassName="rounded-none"
                  className="border-2 border-black focus:ring-0 focus:border-black"
                />
                {errors?.password && (
                  <FieldError>{errors.password}</FieldError>
                )}
              </Field>
            </FieldGroup>

            <div className="flex items-center justify-between">
              <Link 
                to="/auth/forgot-password"
                className="text-sm font-medium text-black underline underline-offset-4 hover:text-gray-700"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-none bg-black text-white hover:bg-gray-800"
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
          </Form>
        </div>

        <p className="text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link 
            to={`/auth/register?redirectTo=${encodeURIComponent(redirectTo)}`}
            className="font-medium text-black underline underline-offset-4 hover:text-gray-700"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
