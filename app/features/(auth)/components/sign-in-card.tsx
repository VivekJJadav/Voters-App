import { useForm } from "react-hook-form";
import { useState } from "react";

import useAuthStore from "@/store/authStore";

import { Button } from "@/components/ui/button";
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
import { voterStore } from "@/app/actions/useGetVoters";
import Image from "next/image";

export const SignInCard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const setUser = useAuthStore((state) => state.setUser);

  const searchParams = useSearchParams();
  const organizationId = searchParams.get("organizationId");
  const departmentId = searchParams.get("departmentId");
  const organizationName = searchParams.get("organizationName");
  const departmentName = searchParams.get("departmentName");

  const form = useForm({
    defaultValues: {
      email: searchParams.get("email") || "",
      password: "",
    },
  });

  const onSubmit = async (values: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      console.log("Submitting login with values:", values);

      const response = await axios.post("/api/login", {
        ...values,
        organizationId: organizationId || undefined,
        departmentId: departmentId || undefined,
        organizationName: organizationName || undefined,
        departmentName: departmentName || undefined,
      });

      console.log("Login response:", response.data); // Check what's coming back

      voterStore.setVoters([]);

      setUser(response.data.user, response.data.token);
      console.log(
        "After setting user - Current auth state:",
        useAuthStore.getState()
      ); // Check store state

      if (response.status === 200 || response.status === 302) {
        window.location.href = "/home";
      }
    } catch (error) {
      // Robust error handling for all cases
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
    <div className="signin-card-wrapper">
      <div className="signin-card">
        {/* Logo Section - Visible only on mobile */}
        <div className="signin-logo-mobile">
          <Image
            src="/voterlogo.svg"
            alt="The Voters Logo"
            width={140}
            height={48}
            className="object-contain signin-logo-img"
            priority
          />
        </div>

        {/* Header */}
        <div className="signin-header">
          <h1 className="signin-title">Welcome back!</h1>
          <p className="signin-subtitle">Sign in to continue to your account</p>
        </div>

        {/* Separator */}
        <div className="signin-separator">
          <div className="signin-separator-line" />
          <span className="signin-separator-text">or login with email</span>
          <div className="signin-separator-line" />
        </div>

        {/* Form */}
        <div className="signin-form-section">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="signin-form">
              <FormField
                name="email"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <label className="signin-label">Email</label>
                    <FormControl>
                      <div className="signin-input-wrapper">
                        <svg className="signin-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="4" width="20" height="16" rx="2" />
                          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                        </svg>
                        <Input
                          {...field}
                          type="email"
                          placeholder="you@example.com"
                          required
                          disabled={isEmailFromLink}
                          className={`signin-input ${isEmailFromLink ? "bg-gray-50" : ""}`}
                        />
                      </div>
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
                    <div className="flex items-center justify-between">
                      <label className="signin-label">Password</label>
                      <Link
                        href="/forgot-password"
                        className="signin-forgot-link"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <FormControl>
                      <div className="signin-input-wrapper">
                        <svg className="signin-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          required
                          className="signin-input"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="signin-eye-btn"
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                              <line x1="1" y1="1" x2="23" y2="23" />
                            </svg>
                          ) : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isLoading}
                size="lg"
                className="signin-btn"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </Form>
        </div>

        {/* Footer */}
        <div className="signin-footer">
          <p className="signin-footer-text">
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="signin-signup-link">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
