import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams, useRouter } from "next/navigation";
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
import { toast } from "sonner";
import Image from "next/image";

export const SignUpCard = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm({
    defaultValues: {
      name: searchParams.get("name") || "",
      email: searchParams.get("email") || "",
      organizationId: searchParams.get("organizationId") || "",
      departmentId: searchParams.get("departmentId") || "",
      organizationName: searchParams.get("organizationName") || "",
      departmentName: searchParams.get("departmentName") || "",
      password: "",
    },
  });

  const onSubmit = async (values: {
    name: string;
    email: string;
    password: string;
    organizationId?: string;
    departmentId?: string;
    organizationName?: string;
    departmentName?: string;
  }) => {
    setLoading(true);
    try {
      const response = await axios.post("/api/register", values);

      if (response.status === 201) {
        router.push(`/sign-in?email=${encodeURIComponent(values.email)}`);
        toast.success("Registration successful! Please sign in.");
      }
    } catch (error: any) {
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
          <h1 className="signin-title">Sign Up</h1>
          <p className="signin-subtitle">
            By signing up, you agree to our{" "}
            <Link href="/privacy" className="text-[#667eea] hover:underline">
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link href="/terms" className="text-[#667eea] hover:underline">
              Terms of service
            </Link>
          </p>
        </div>

        {/* Separator */}
        <div className="signin-separator">
          <div className="signin-separator-line" />
          <span className="signin-separator-text">create your account</span>
          <div className="signin-separator-line" />
        </div>

        {/* Form */}
        <div className="signin-form-section">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="signin-form">
              <FormField
                name="name"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <label className="signin-label">Name</label>
                    <FormControl>
                      <div className="signin-input-wrapper">
                        <svg className="signin-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                        <Input
                          {...field}
                          type="text"
                          placeholder="Enter your name"
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
                          placeholder="Enter email address"
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
                    <label className="signin-label">Password</label>
                    <FormControl>
                      <div className="signin-input-wrapper">
                        <svg className="signin-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
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
              <Button disabled={loading} size="lg" className="signin-btn">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing up...
                  </span>
                ) : (
                  "Sign up"
                )}
              </Button>
            </form>
          </Form>
        </div>

        {/* Footer */}
        <div className="signin-footer">
          <p className="signin-footer-text">
            Already have an account?{" "}
            <Link href="/sign-in" className="signin-signup-link">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
