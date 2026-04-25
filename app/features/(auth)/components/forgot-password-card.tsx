import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export const ForgotPasswordCard = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const form = useForm({
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: { email: string }) => {
    try {
      setLoading(true);
      setMessage(null);
      setError(null);

      const response = await axios.post("/api/forgot-password", values);
      setMessage(
        response.data?.message ||
          "If an account exists for this email, a password reset link has been sent."
      );
    } catch (err) {
      setError(
        axios.isAxiosError(err)
          ? err.response?.data?.error || "Failed to send reset link."
          : "Failed to send reset link."
      );
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="signin-title">Forgot password?</h1>
          <p className="signin-subtitle">
            Enter your email and we will send you a reset link.
          </p>
        </div>

        {/* Separator */}
        <div className="signin-separator">
          <div className="signin-separator-line" />
          <span className="signin-separator-text">reset password</span>
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
                          placeholder="Enter email address"
                          required
                          className="signin-input"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={loading}
                size="lg"
                className="signin-btn"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Sending...
                  </span>
                ) : (
                  "Send reset link"
                )}
              </Button>
            </form>
          </Form>
        </div>

        {message && (
          <Alert className="mb-6 bg-[rgba(255,255,255,0.05)] border-[rgba(102,126,234,0.3)] text-white">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
        {error && (
          <Alert variant="destructive" className="mb-6 bg-destructive/10 text-red-200 border-red-500/30">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Footer */}
        <div className="signin-footer">
          <p className="signin-footer-text">
            Remember your password?{" "}
            <Link href="/sign-in" className="signin-signup-link">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
