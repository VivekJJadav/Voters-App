import { Vote } from "@prisma/client";
import VoteContainer from "./VoteContainer";
import { useRouter } from "next/navigation";

interface VoteContainerProps {
  vote: Vote;
}

const Votes = ({ vote }: VoteContainerProps) => {
  const router = useRouter();

  const onClick = () => {
    router.push(`/vote/${vote.id}`); 
  };

  return (
    <div className="w-[400px] h-44 bg-gray-100 mx-2 my-2 rounded-lg shadow-md border-[1px] hover:border-black/40 flex">
      <VoteContainer vote={vote} onClick={onClick} />
    </div>
  );
};

export default Votes;
