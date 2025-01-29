"use client";

import useGetVote from "@/app/actions/useGetVote";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useParams } from "next/navigation";

const VotePage = () => {
  const params = useParams();
  const voteId = Array.isArray(params.voteId)
    ? params.voteId[0]
    : params.voteId;

  const { vote, loading } = useGetVote(voteId);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-50 pt-20 pb-12">
      <header className="mx-auto max-w-3xl bg-gradient-to-br from-emerald-50 to-indigo-50 rounded-xl shadow-md border border-gray-100 mt-8">
        <div className="text-center px-6 py-6 space-y-3">
          <h1 className="text-3xl font-bold text-emerald-800 relative inline-block">
            {vote?.name}
            <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
          </h1>

          <div className="flex items-center justify-center space-x-2">
            <div className="bg-indigo-600 text-white px-4 py-1.5 rounded-full text-sm font-medium flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              <span>{vote?.candidates?.length || 0} Participants</span>
            </div>
            <div className="h-2 w-2 bg-emerald-400 rounded-full animate-pulse" />
          </div>
        </div>
      </header>

      {loading ? (
        <div className="mt-16 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {vote?.candidates.map((candidate) => (
              <div
                key={candidate.id}
                className="group relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-out"
              >
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                        <span className="text-purple-600 font-bold text-lg">
                          {candidate.user.name[0]}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">
                        {candidate.user.name}
                      </h3>
                    </div>
                  </div>

                  <div className="mt-4">
                    <blockquote className="border-l-4 border-purple-500 pl-4">
                      <p className="text-gray-600 italic">
                        {vote?.slogans?.find(
                          (slogan) => slogan.userId === candidate.user.id
                        )?.content || "No slogan provided"}
                      </p>
                    </blockquote>
                  </div>
                </div>

                {/* Voting Button */}
                <div className="px-6 pb-4">
                  <button className="w-full py-2 bg-slate-500 hover:bg-slate-600 text-white rounded-lg font-semibold shadow-md transition-all transform hover:scale-[1.02]">
                    Vote Now
                  </button>
                </div>

                {/* Live Status Indicator */}
                <div className="absolute top-4 right-4 flex items-center">
                  <div className="h-3 w-3 bg-green-400 rounded-full animate-pulse mr-2"></div>
                  <span className="text-xs text-green-600 font-medium">
                    Live
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VotePage;
