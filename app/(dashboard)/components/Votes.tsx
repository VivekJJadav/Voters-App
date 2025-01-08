import { Vote } from "@prisma/client";
import VoteContainer from "./VoteContainer";

interface VoteContainerProps {
  vote: Vote;
}

const Votes = ({ vote }: VoteContainerProps) => {
  return (
    <div className="w-[400px] h-44 bg-gray-100 mx-2 my-2 rounded-lg shadow-md border-[1px] hover:border-black/40 flex z-[-50]">
      <VoteContainer vote={vote} />
    </div>
  );
};

export default Votes;