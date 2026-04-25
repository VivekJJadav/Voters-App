"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { Check, MailCheck, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Choice = "yes" | "no";
type SavedState = "accepted" | "declined" | null;

interface CandidateResponseDetails {
  voteId: string;
  voteName: string;
  organizationName: string;
  departmentName: string | null;
  userName: string;
  accepted: boolean;
  slogan: string;
  sloganMaxLength: number;
}

interface CandidateResponseClientProps {
  token?: string;
  initialChoice?: string;
}

const CandidateResponseClient = ({
  token,
  initialChoice,
}: CandidateResponseClientProps) => {
  const normalizedInitialChoice =
    initialChoice === "no" || initialChoice === "yes"
      ? initialChoice
      : "yes";
  const [details, setDetails] = useState<CandidateResponseDetails | null>(null);
  const [choice, setChoice] = useState<Choice>(normalizedInitialChoice);
  const [slogan, setSlogan] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [savedState, setSavedState] = useState<SavedState>(null);
  const [error, setError] = useState<string | null>(null);

  const remainingCharacters = useMemo(() => {
    if (!details) return 0;
    return details.sloganMaxLength - slogan.length;
  }, [details, slogan]);

  useEffect(() => {
    const fetchInvitation = async () => {
      if (!token) {
        setError("Invitation link is missing a token.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get<CandidateResponseDetails>(
          `/api/candidate-response?${new URLSearchParams({ token }).toString()}`
        );
        setDetails(response.data);
        setSlogan(response.data.slogan || "");
        setSavedState(response.data.accepted ? "accepted" : null);
      } catch (err) {
        setError(
          axios.isAxiosError(err)
            ? err.response?.data?.error || "Invitation link is invalid."
            : "Invitation link is invalid."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchInvitation();
  }, [token]);

  const saveResponse = async (decision: "accept" | "decline") => {
    if (!token) return;

    try {
      setSubmitting(true);
      setError(null);

      await axios.post("/api/candidate-response", {
        token,
        decision,
        slogan,
      });

      setSavedState(decision === "accept" ? "accepted" : "declined");
    } catch (err) {
      setError(
        axios.isAxiosError(err)
          ? err.response?.data?.error || "Failed to save your response."
          : "Failed to save your response."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error && !details) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md rounded-lg shadow-sm">
          <CardHeader>
            <CardTitle>Candidate Response</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!details) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-xl rounded-lg shadow-sm border-gray-200">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <Badge variant="secondary" className="w-fit">
              {details.departmentName || details.organizationName}
            </Badge>
            {savedState === "accepted" && (
              <Badge className="bg-emerald-600">Accepted</Badge>
            )}
            {savedState === "declined" && (
              <Badge variant="outline">Declined</Badge>
            )}
          </div>
          <div>
            <CardTitle className="text-2xl leading-tight">
              {details.voteName}
            </CardTitle>
            <CardDescription className="mt-2">
              Hi {details.userName}, would you like to be a candidate?
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant={choice === "yes" ? "default" : "outline"}
              onClick={() => setChoice("yes")}
              className="h-11"
            >
              <Check className="size-4 mr-2" />
              Yes
            </Button>
            <Button
              type="button"
              variant={choice === "no" ? "default" : "outline"}
              onClick={() => setChoice("no")}
              className="h-11"
            >
              <X className="size-4 mr-2" />
              No
            </Button>
          </div>

          {choice === "yes" ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="slogan">Slogan</Label>
                <span
                  className={`text-xs ${
                    remainingCharacters < 0
                      ? "text-red-600"
                      : "text-muted-foreground"
                  }`}
                >
                  {remainingCharacters}
                </span>
              </div>
              <Textarea
                id="slogan"
                value={slogan}
                maxLength={details.sloganMaxLength}
                onChange={(event) => setSlogan(event.target.value)}
                placeholder="Enter your campaign slogan"
                className="min-h-28 resize-none"
              />
              <Button
                type="button"
                onClick={() => saveResponse("accept")}
                disabled={submitting}
                className="w-full h-11"
              >
                {submitting ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <MailCheck className="size-4 mr-2" />
                    Submit Candidacy
                  </>
                )}
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => saveResponse("decline")}
              disabled={submitting}
              className="w-full h-11"
            >
              {submitting ? <LoadingSpinner size="sm" /> : "Decline Candidacy"}
            </Button>
          )}

          {error && (
            <p className="text-sm text-red-600 text-center" role="alert">
              {error}
            </p>
          )}
          {savedState === "accepted" && (
            <p className="text-sm text-emerald-700 text-center">
              Your candidacy is saved.
            </p>
          )}
          {savedState === "declined" && (
            <p className="text-sm text-muted-foreground text-center">
              Your response is saved.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CandidateResponseClient;
