"use client";

import useGetVote from "@/app/actions/useGetVote";
import { Vote } from "@prisma/client";

interface VoteContainerProps {
  currentVote: Vote;
  onClick: () => void;
}

const VoteContainer = ({ currentVote, onClick }: VoteContainerProps) => {
  const { vote } = useGetVote(currentVote.id);

  const getStatusInfo = () => {
    if (!vote) return { isActive: false, display: null };

    const now = new Date();
    const startTime = new Date(vote.startTime);
    const endTime = vote.endTime ? new Date(vote.endTime) : null;
    const isActive = startTime <= now && (!endTime || endTime > now);

    return {
      isActive,
      display: isActive ? (
        <>
          <div className="h-2.5 w-2.5 bg-green-500 rounded-full animate-pulse mr-2"></div>
          <span className="text-xs text-emerald-600 font-medium">Live</span>
        </>
      ) : (
        <>
          <div className="h-2.5 w-2.5 bg-gray-400 rounded-full mr-2"></div>
          <span className="text-xs text-gray-600 font-medium">Ended</span>
        </>
      )
    };
  };

  const statusInfo = getStatusInfo();
  const isActive = statusInfo.isActive;

  return (
    <div
      onClick={isActive ? onClick : undefined}
      className={`group relative w-full h-auto min-h-[11rem] rounded-xl shadow-lg transition-all duration-300 ease-out 
        border border-gray-100 bg-gradient-to-br ${
          isActive
            ? "from-emerald-50 to-indigo-50 hover:shadow-2xl cursor-pointer"
            : "from-gray-50 to-gray-100 grayscale opacity-75 cursor-not-allowed"
        }`}
    >
      <div className="absolute top-4 right-4 flex items-center">
        {statusInfo.display}
      </div>

      <div className="p-5 space-y-4 pb-16">
        <div className="relative">
          <h3
            className={`text-lg font-bold ${
              isActive ? "text-black" : "text-gray-500"
            } break-words`}
          >
            {currentVote.name}
          </h3>
        </div>

        <p
          className={`text-sm rounded-lg py-2 px-3 shadow-sm break-words ${
            isActive
              ? "text-gray-600 bg-white/80"
              : "text-gray-400 bg-gray-100/80"
          }`}
        >
          {currentVote.description}
        </p>

        <div className="absolute bottom-4 right-4 flex items-center gap-2">
          <button
            className={`w-10 h-10 rounded-full shadow-md transition-all duration-300 transform flex items-center justify-center ${
              isActive
                ? "bg-indigo-600 hover:bg-indigo-700 text-white hover:scale-110 group-hover:ring-4 ring-indigo-100"
                : "bg-gray-300 text-gray-400 cursor-not-allowed"
            }`}
            disabled={!isActive}
          >
            🗳️
          </button>
        </div>
      </div>

      {isActive && (
        <div
          className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-500/0 to-indigo-500/0 
          opacity-0 group-hover:opacity-10 transition-opacity duration-300"
        />
      )}
    </div>
  );
};

export default VoteContainer;