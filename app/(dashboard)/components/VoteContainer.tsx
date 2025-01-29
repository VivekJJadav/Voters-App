import { Button } from "@/components/ui/button";
import { Vote } from "@prisma/client";

interface VoteContainerProps {
  vote: Vote;
  onClick: () => void;
}

const VoteContainer = ({ vote, onClick }: VoteContainerProps) => {
  return (
    <div
      onClick={onClick}
      className="group relative w-80 h-44 bg-white rounded-xl shadow-lg 
        hover:shadow-2xl transition-all duration-300 ease-out cursor-pointer
        border border-gray-100 bg-gradient-to-br from-emerald-50 to-indigo-50"
    >
      <div className="absolute top-4 right-4 flex items-center">
        <div className="h-2.5 w-2.5 bg-emerald-400 rounded-full animate-pulse mr-2"></div>
        <span className="text-xs text-emerald-600 font-medium">Live</span>
      </div>

      <div className="p-5 space-y-4">
        <div className="relative">
          <h3 className="text-lg font-bold text-black">{vote.name}</h3>
          {/* <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" /> */}
        </div>

        <p className="text-sm text-gray-600 line-clamp-2 bg-white/80 rounded-lg py-2 px-3 shadow-sm">
          {vote.description}
        </p>

        <div className="absolute bottom-4 right-4 flex items-center gap-2">
          <button
            className="w-10 h-10 bg-indigo-600 hover:bg-indigo-700 text-white 
            rounded-full shadow-md transition-all duration-300 transform 
            hover:scale-110 flex items-center justify-center group-hover:ring-4 
            ring-indigo-100"
          >
            🗳️
          </button>
        </div>
      </div>

      <div
        className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-500/0 to-indigo-500/0 
        opacity-0 group-hover:opacity-10 transition-opacity duration-300"
      />
    </div>
  );
};

export default VoteContainer;
