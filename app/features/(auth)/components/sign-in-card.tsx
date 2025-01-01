import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { useState } from "react";

import useAuthStore from "@/store/authStore";

import { DottedSeparator } from "@/components/dotted-separator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import Link from "next/link";
import axios from "axios";
import { useSearchParams } from "next/navigation";

export const SignInCard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const setUser = useAuthStore((state) => state.setUser);

  const searchParams = useSearchParams();

  const form = useForm({
    defaultValues: {
      email: searchParams.get("email") || "",
      password: "",
    },
  });

  const onSubmit = async (values: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const response = await axios.post("/api/login", values);

      setUser(response.data.user, response.data.token);

      if (response.status === 200 || response.status === 302) {
        window.location.href = "/home";
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error response data:", error.response?.data);
        alert(error.response?.data?.error || "Sign-in failed.");
      } else {
        console.error("Unexpected error:", error);
        alert("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isEmailFromLink = searchParams.has("email");

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full h-full md:w-[487px] border-none shadow-none">
        <CardHeader className="flex items-center justify-center text-center p-7">
          <CardTitle className="text-2xl">Welcome back!</CardTitle>
        </CardHeader>
        <div className="px-7">
          <DottedSeparator />
        </div>
        <CardContent className="p-7">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                name="email"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="Enter email address"
                        required
                        disabled={isEmailFromLink}
                        className={isEmailFromLink ? "bg-gray-100" : ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="password"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="Enter password"
                        required
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={isLoading}
                size="lg"
                className="w-full"
              >
                {isLoading ? "Signing in..." : "Login"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <div className="px-7">
          <DottedSeparator />
        </div>
        <CardContent className="p-7 flex flex-col gap-y-4">
          <Button
            variant="secondary"
            size="lg"
            className="w-full"
            disabled={isLoading}
          >
            <FcGoogle className="mr-2 size-5" />
            Login with Google
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className="w-full"
            disabled={isLoading}
          >
            <FaGithub className="mr-2 size-5" />
            Login with Github
          </Button>
        </CardContent>
        <div className="px-7">
          <DottedSeparator />
        </div>
        <CardContent className="p-7 flex items-center justify-center">
          <p>
            Don&apos;t have an account?
            <Link href="/sign-up">
              <span className="text-blue-700">&nbsp;Sign Up</span>
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
