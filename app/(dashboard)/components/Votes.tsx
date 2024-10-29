import VoteContainer from "./VoteContainer";

type vote = {
  name: string;
  description: string;
  isActive: boolean;
};

interface VoteContainerProps {
  vote: vote;
}

const Votes = ({ vote }: VoteContainerProps) => {
  return (
    <div className="w-[400px] h-44 bg-gray-100 mx-2 my-2 rounded-lg shadow-md border-[1px] hover:border-black/40 flex z-[-50]">
      <VoteContainer vote={vote} />
    </div>
  );
};

export default Votes;
