import { Button } from "@/components/ui/button";
import { Vote } from "@prisma/client";

interface VoteContainerProps {
  vote: Vote;
  onClick: () => void;
}

const VoteContainer = ({ vote, onClick }: VoteContainerProps) => {
  return (
    <div
      className="relative w-72 h-40 bg-slate-300 rounded-2xl p-4 shadow-lg transition-transform transform hover:scale-105 hover:shadow-2xl"
      onClick={onClick}
    >
      <div className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-green-600 border-green-400 hover:bg-green-700 hover:border-green-500"></div>

      <div className="bg-white px-4 py-2 w-60 rounded-lg text-lg font-bold text-gray-800 shadow-md">
        {vote.name}
      </div>

      <div
        className="bg-gray-100 px-4 py-3 mt-3 w-52 rounded-lg text-sm text-gray-800 shadow-md"
      >
        {vote.description}
      </div>

      <button className="absolute bottom-4 right-4 w-10 h-10 bg-gray-800 text-white font-bold rounded-full shadow-md transition-transform hover:scale-110 hover:bg-gray-900">
        🗳️
      </button>
    </div>
  );
};

export default VoteContainer;
