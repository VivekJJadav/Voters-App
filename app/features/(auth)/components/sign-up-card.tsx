"use client";

import axios from "axios";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { useSearchParams, useRouter } from "next/navigation";
import { DottedSeparator } from "@/components/dotted-separator";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import Link from "next/link";
import { toast } from "sonner";
import Image from "next/image";

export const SignUpCard = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      name: searchParams.get("name") || "",
      email: searchParams.get("email") || "",
      organizationId: searchParams.get("organizationId") || "",
      departmentId: searchParams.get("departmentId") || "",
      password: "",
    },
  });

  const onSubmit = async (values: {
    name: string;
    email: string;
    password: string;
    organizationId?: string;
    departmentId?: string;
  }) => {
    setLoading(true);
    try {
      const response = await axios.post("/api/register", values);

      if (response.status === 201) {
        router.push(`/sign-in?email=${encodeURIComponent(values.email)}`);
        toast.success("Registration successful! Please sign in.");
      }
    } catch (error: any) {
      // Robust error handling for all cases
      console.error("Registration error:", error);
      if (error.response?.status === 409) {
        router.push(`/sign-in?email=${encodeURIComponent(values.email)}`);
        toast.error("Email already exists. Please sign in.");
        return;
      }
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const isEmailFromLink = searchParams.has("email");

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full h-full md:w-[487px] border-none shadow-none">
        {/* Logo Section - Adjusted for SVG */}
        <div className="flex justify-center pt-6 px-4 sm:pt-8">
          <div className="relative w-full max-w-[180px] sm:max-w-[200px] aspect-[4/1]">
            <Image
              src="/voterlogo.svg" // Update with your SVG path
              alt="Company Logo"
              width={200}
              height={50}
              style={{
                width: "100%",
                height: "auto",
              }}
              className="object-contain"
              priority
            />
          </div>
        </div>
        <CardHeader className="flex items-center justify-center text-center p-7">
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <CardDescription>
            By signing up, you agree to our{" "}
            <Link href="/privacy">
              <span className="text-blue-700">Privacy Policy</span>
            </Link>{" "}
            and{" "}
            <Link href="/terms">
              <span className="text-blue-700">Terms of service</span>
            </Link>
          </CardDescription>
        </CardHeader>
        <div className="px-7">
          <DottedSeparator />
        </div>
        <CardContent className="p-7">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                name="name"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        placeholder="Enter your name"
                        disabled={isEmailFromLink}
                        className={isEmailFromLink ? "bg-gray-100" : ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                        placeholder="Enter your password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button disabled={loading} size="lg" className="w-full">
                {loading ? "Signing up..." : "Sign up"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <div className="px-7">
          <DottedSeparator />
        </div>
        {/* <CardContent className="p-7 flex flex-col gap-y-4">
          <Button
            variant="secondary"
            size="lg"
            className="w-full"
            disabled={loading}
          >
            <FcGoogle className="mr-2 size-5" />
            Login with Google
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className="w-full"
            disabled={loading}
          >
            <FaGithub className="mr-2 size-5" />
            Login with Github
          </Button>
        </CardContent>
        <div className="px-7">
          <DottedSeparator />
        </div> */}
        <CardContent className="p-7 flex items-center justify-center">
          <p>
            Already have an account?
            <Link href="/sign-in">
              <span className="text-blue-700">&nbsp;Sign In</span>
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
