"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Crown, Trophy } from "lucide-react";
import ResultChart from "../../components/ResultChart";

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
  const params = useParams();
  const voteId = Array.isArray(params.voteId) ? params.voteId[0] : params.voteId;

  const [results, setResults] = useState<VoteDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const response = await axios.get<VoteDetails>(`/api/vote/${voteId}/submit`);
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
      <div className="min-h-screen flex items-center justify-center mt-24">
        <div className="text-red-500 px-4 text-center">{error}</div>
      </div>
    );
  }

  if (!results) return null;

  const sortedCandidates = results.candidates.sort((a, b) => b.votes - a.votes);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-8">
          <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent px-4 mb-6">
            {results.voteName}
          </h1>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div className="inline-flex items-center px-6 py-3 bg-white rounded-2xl shadow-md backdrop-blur-sm bg-opacity-90">
              <Trophy className="w-5 h-5 mr-2 text-violet-600" />
              <span className="text-gray-700 font-semibold text-sm sm:text-base">
                Winner: {results.candidates.filter((candidate) => candidate.isWinner).map((candidate) => candidate.name)}
              </span>
            </div>
          </div>
        </header>

        {/* Main content - side by side on larger screens */}
        <div className="">
          {/* Chart Section */}
          {/* <div className="mb-8 lg:mb-0">
            <div className="bg-white p-6 rounded-2xl shadow-lg backdrop-blur-sm bg-opacity-90 h-full">
              <ResultChart candidates={results.candidates} totalVotes={results.totalVotes} />
            </div>
          </div> */}

          {/* Candidates Section */}
          <div className="flex flex-wrap gap-6 justify-center items-stretch w-full">
            {sortedCandidates.map((candidate) => (
              <div
                key={candidate.id}
                className={`flex-1 min-w-[280px] max-w-xs bg-white rounded-2xl shadow-lg backdrop-blur-sm bg-opacity-90 p-6 relative 
                  transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl
                  ${candidate.isWinner ? "ring-2 ring-yellow-400" : ""}
                `}
                style={{ flexBasis: '320px' }}
              >
                {candidate.isWinner && (
                  <div className="absolute -top-3 -right-3 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full p-2 shadow-lg">
                    <Crown className="h-5 w-5 text-white" />
                  </div>
                )}

                <div className="flex items-center space-x-4">
                  <div
                    className={`
                      h-16 w-16 rounded-2xl flex items-center justify-center 
                      text-2xl font-bold text-white shadow-md
                      ${
                        candidate.isWinner
                          ? "bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600"
                          : "bg-gradient-to-br from-violet-500 via-violet-600 to-indigo-600"
                      }
                    `}
                  >
                    {candidate.name[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xl font-bold text-gray-800 truncate mb-1">
                      {candidate.name}
                    </h3>
                    <p className="text-violet-600 font-medium text-sm truncate">
                      {candidate.slogan}
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex justify-between text-sm font-medium mb-2">
                    <span className="text-gray-600">Total Votes</span>
                    <span className="text-violet-600 font-semibold">{candidate.votes.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 
                        ${candidate.isWinner ? "bg-gradient-to-r from-yellow-400 to-yellow-500" : "bg-gradient-to-r from-violet-500 to-indigo-600"}
                      `}
                      style={{
                        width: `${results.totalVotes > 0 ? (candidate.votes / results.totalVotes) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                  <div className="text-right text-sm font-medium text-gray-600 mt-1">
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
    </div>
  );
};

export default Result;