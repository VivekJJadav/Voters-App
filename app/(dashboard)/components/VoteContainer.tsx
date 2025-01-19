import { Button } from "@/components/ui/button";
import { Vote } from "@prisma/client";

interface VoteContainerProps {
  vote: Vote;
  onClick: () => void;
}

const VoteContainer = ({ vote, onClick }: VoteContainerProps) => {
  return (
    <div
      className="flex flex-col w-full h-full p-4 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex-1">
        <h3 className="text-xl font-semibold mb-2">{vote.name}</h3>
        <p className="text-gray-600">{vote.description}</p>
      </div>
      <Button
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        className="w-full mt-auto"
      >
        Vote
      </Button>
    </div>
  );
};

export default VoteContainer;
