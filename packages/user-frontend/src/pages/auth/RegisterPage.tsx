import { Form, useActionData, useNavigation, Link, useSearchParams } from "react-router-dom";
import { Field, FieldLabel, FieldDescription, FieldError, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/features/auth/components/PasswordInput";
import type { ActionResponse } from "@e-com/shared/schemas";

export default function RegisterPage() {
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
            Create Account
          </h1>
          <p className="text-gray-600">
            Enter your details to get started
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
              <FieldLabel htmlFor="firstName">First Name</FieldLabel>
              <Input
                id="firstName"
                name="firstName"
                placeholder="John"
                className="rounded-none border-2 border-black focus:ring-0 focus:border-black"
              />
              {errors?.firstName && (
                <FieldError>{errors.firstName}</FieldError>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
              <Input
                id="lastName"
                name="lastName"
                placeholder="Doe"
                className="rounded-none border-2 border-black focus:ring-0 focus:border-black"
              />
              {errors?.lastName && (
                <FieldError>{errors.lastName}</FieldError>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
                className="rounded-none border-2 border-black focus:ring-0 focus:border-black"
              />
              <FieldDescription>Well send updates to this address</FieldDescription>
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
              <FieldDescription>
                8-16 characters, uppercase, lowercase, number, special char
              </FieldDescription>
              {errors?.password && (
                <FieldError>{errors.password}</FieldError>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm password"
                containerClassName="rounded-none"
                className="border-2 border-black focus:ring-0 focus:border-black"
              />
              {errors?.confirmPassword && (
                <FieldError>{errors.confirmPassword}</FieldError>
              )}
            </Field>
          </FieldGroup>

          <div className="flex gap-4 pt-2">
            <Button
              type="reset"
              variant="outline"
              className="flex-1 rounded-none border-2 border-black hover:bg-gray-100"
            >
              Reset
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-none bg-black text-white hover:bg-gray-800"
            >
              {isSubmitting ? "Creating..." : "Create Account"}
            </Button>
          </div>
        </Form>
        </div>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link 
            to={`/auth/login?redirectTo=${encodeURIComponent(redirectTo)}`}
            className="font-medium text-black underline underline-offset-4 hover:text-gray-700"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
