"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import useAuthStore from "@/store/authStore";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Crown } from "lucide-react";

// Define interfaces that match your Prisma schema
interface VoteResult {
  id: string;
  voteCount: number;
  isWinner: boolean;
  statistics: {
    votes: number;
  } | null;
  candidateId: string;
}

interface VoteDetails {
  voteName: string;
  totalVotes: number;
  candidates: Array<{
    id: string;
    name: string;
    slogan: string;
    votes: number;
    isWinner: boolean;
    statistics: any;
  }>;
  endDate: string;
  isActive: boolean;
}

const Result = () => {
  const token = useAuthStore((state) => state.token);
  const params = useParams();
  const voteId = Array.isArray(params.voteId)
    ? params.voteId[0]
    : params.voteId;

  const [results, setResults] = useState<VoteDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const response = await axios.get<VoteDetails>(
          `/api/vote/${voteId}/submit`
        );
        setResults(response.data);
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to fetch results");
        console.error("Error fetching results:", err);
      } finally {
        setLoading(false);
      }
    };

    if (voteId) {
      fetchResults();
    }
  }, [voteId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!results) return null;

  // Transform data for the chart and sort by votes
  const sortedCandidates = results.candidates.sort((a, b) => b.votes - a.votes);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-50 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-indigo-600 bg-clip-text text-transparent">
            {results.voteName} - Results
          </h1>
          <div className="mt-4 inline-flex items-center px-4 py-2 bg-white rounded-full shadow-sm">
            <span className="text-gray-600 font-medium">
              Total Votes Cast: {results.totalVotes}
            </span>
          </div>
        </header>

        {/* Results Chart */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8 h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sortedCandidates}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="votes" fill="#8884d8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Detailed Results */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sortedCandidates.map((candidate, index) => (
            <div
              key={candidate.id}
              className={`bg-white rounded-xl shadow-lg p-6 relative ${
                candidate.isWinner ? "ring-2 ring-yellow-400" : ""
              }`}
            >
              {candidate.isWinner && (
                <div className="absolute -top-3 -right-3 bg-yellow-400 rounded-full p-2">
                  <Crown className="h-5 w-5 text-white" />
                </div>
              )}

              <div className="flex items-center space-x-4">
                <div
                  className={`
                  h-14 w-14 rounded-full flex items-center justify-center 
                  text-2xl font-bold text-white
                  ${
                    index === 0
                      ? "bg-gradient-to-br from-yellow-400 to-yellow-600"
                      : "bg-gradient-to-br from-purple-500 to-indigo-600"
                  }
                `}
                >
                  {candidate.name[0]}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {candidate.name}
                  </h3>
                  <p className="text-purple-600 font-medium">
                    {candidate.slogan}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Votes</span>
                  <span>{candidate.votes}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${
                      index === 0 ? "bg-yellow-400" : "bg-purple-600"
                    }`}
                    style={{
                      width: `${
                        results.totalVotes > 0
                          ? (candidate.votes / results.totalVotes) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
                <div className="text-right text-sm text-gray-600 mt-1">
                  {results.totalVotes > 0
                    ? ((candidate.votes / results.totalVotes) * 100).toFixed(1)
                    : 0}
                  %
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Result;
