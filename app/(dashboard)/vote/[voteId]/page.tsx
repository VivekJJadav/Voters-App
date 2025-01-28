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
    <div className="pt-32">
      <div className="text-2xl font-semibold bg-orange-700 text-white py-4 mb-6 text-center">
        {vote?.name}
      </div>

      {loading && <LoadingSpinner size="lg" />}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
        {vote?.candidates.map((candidate) => (
          <div
            key={candidate.id}
            className="relative bg-slate-300 rounded-2xl p-6 shadow-lg transition-transform transform hover:scale-105 hover:shadow-2xl"
          >
            <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-green-600 border border-green-400 hover:bg-green-700 hover:border-green-500"></div>

            <div className="bg-white px-4 py-2 rounded-lg text-lg font-bold text-gray-800 shadow-md">
              {candidate.user.name}
            </div>

            <div className="bg-gray-100 px-4 py-3 mt-4 rounded-lg text-sm text-gray-800 shadow-md">
              {vote?.slogans?.find(
                (slogan) => slogan.userId === candidate.user.id
              )?.content || "No slogan"}
            </div>

            <button className="absolute bottom-4 right-4 w-10 h-10 bg-gray-800 text-white font-bold rounded-full shadow-md transition-transform hover:scale-110 hover:bg-gray-900"></button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VotePage;
