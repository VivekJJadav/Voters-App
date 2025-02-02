"use client";

import useGetVote from "@/app/actions/useGetVote";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import { AlertCircle, Check, ChevronRight } from "lucide-react";
import useAuthStore from "@/store/authStore";

const VotePage = () => {
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const params = useParams();
  const voteId = Array.isArray(params.voteId)
    ? params.voteId[0]
    : params.voteId;
  const { vote, loading } = useGetVote(voteId);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(
    null
  );
  const [votedCandidate, setVotedCandidate] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCandidateSelect = (candidateId: string) => {
    if (votedCandidate) return;
    setSelectedCandidate(candidateId);
    setError(null);
  };

  const handleSubmitVote = async () => {
    if (!selectedCandidate) {
      setError("Please select a candidate first");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      if (!token) {
        setError("You must be logged in to vote");
        return;
      }

      await axios.post(
        `/api/vote/${voteId}/submit`,
        {
          candidateId: selectedCandidate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setVotedCandidate(selectedCandidate);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || "Failed to submit vote");

        if (err.response?.status === 401) {
          logout();
        }
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-50 pt-20 pb-12 relative">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="absolute inset-0 flex justify-center items-end pointer-events-none">
          <div className="animate-confetti">🎉</div>
        </div>
      )}

      {/* Success Toast */}
      {votedCandidate && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center space-x-2 animate-slideUp">
          <Check className="h-5 w-5" />
          <span>Vote submitted successfully!</span>
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center space-x-2 animate-slideUp mb-52">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      <header className="mx-auto max-w-3xl bg-white rounded-2xl shadow-sm border border-gray-100 mt-8 backdrop-blur-lg">
        <div className="text-center px-6 py-8 space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-indigo-600 bg-clip-text text-transparent">
            {vote?.name}
          </h1>
          <div className="flex items-center justify-center space-x-3">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-5 py-1.5 rounded-full text-sm font-medium flex items-center">
              <span>🎯 {vote?.candidates?.length || 0} Participants</span>
            </div>
            <div className="flex items-center bg-emerald-100 px-3 py-1 rounded-full">
              <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse mr-2" />
              <span className="text-xs text-emerald-800 font-medium">
                Live Voting
              </span>
            </div>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="mt-16 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vote?.candidates.map((candidate) => {
                const slogan = vote.slogans?.find(
                  (s) => s.userId === candidate.user.id
                );
                const isSelected = selectedCandidate === candidate.id;
                const hasVoted = votedCandidate === candidate.id;

                return (
                  <div
                    key={candidate.id}
                    onClick={() => handleCandidateSelect(candidate.id)}
                    className={`
                      group relative bg-white rounded-xl shadow-lg transition-all duration-300 border-2 
                      ${
                        isSelected
                          ? "border-purple-500 shadow-purple-100"
                          : "border-transparent hover:border-purple-100"
                      }
                      ${!votedCandidate && "cursor-pointer hover:shadow-xl"}
                    `}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />

                    <div className="p-6 relative z-10">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div
                            className={`
                            h-14 w-14 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-md
                            ${
                              isSelected
                                ? "bg-gradient-to-br from-purple-600 to-indigo-700"
                                : "bg-gradient-to-br from-purple-500 to-indigo-600"
                            }
                          `}
                          >
                            {candidate.user.name[0]}
                          </div>
                        </div>

                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900">
                            {candidate.user.name}
                          </h3>
                          {slogan && (
                            <p className="text-sm text-purple-600 font-medium mt-1">
                              {candidate.user.isCandidate}
                            </p>
                          )}
                        </div>

                        {isSelected && (
                          <div className="h-6 w-6 bg-purple-500 rounded-full flex items-center justify-center">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>

                      {slogan ? (
                        <div className="mt-5 bg-purple-50/50 rounded-lg p-4 border border-purple-100">
                          <div className="flex items-start space-x-2 text-purple-900">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 shrink-0 mt-0.5 text-purple-500"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM7 8a1 1 0 012 0 1 1 0 11-2 0zm4 0a1 1 0 012 0 1 1 0 11-2 0zm2 3a1 1 0 100-2 1 1 0 000 2z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <p className="italic font-medium">
                              {slogan.content}
                            </p>
                          </div>
                        </div>
                      ): <p>No slogan</p>}
                    </div>

                    {hasVoted && (
                      <div className="px-6 pb-4 relative z-10">
                        <div className="w-full py-3 rounded-xl font-bold bg-emerald-500 text-white flex items-center justify-center space-x-2">
                          <Check className="h-5 w-5" />
                          <span>Voted</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          {!votedCandidate && (
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md px-4">
              <button
                onClick={handleSubmitVote}
                disabled={!selectedCandidate || isSubmitting}
                className={`
                  w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all
                  flex items-center justify-center space-x-2
                  ${
                    selectedCandidate
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                      : "bg-gray-400 cursor-not-allowed"
                  }
                `}
              >
                {isSubmitting ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <span>Submit Vote</span>
                    <ChevronRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VotePage;
