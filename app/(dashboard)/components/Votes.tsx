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
    <div className="flex mx-2 my-2">
      <VoteContainer vote={vote} onClick={onClick} />
    </div>
  );
};

export default Votes;
