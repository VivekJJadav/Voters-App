import { Vote } from "@prisma/client";
import VoteContainer from "./VoteContainer";
import { useRouter } from "next/navigation";

interface VoteContainerProps {
  currentVote: Vote;
}

const Votes = ({ currentVote }: VoteContainerProps) => {
  const router = useRouter();

  const onClick = () => {
    router.push(`/vote/${currentVote.id}`);
  };

  return (
    <div className="w-full">
      <VoteContainer currentVote={currentVote} onClick={onClick} />
    </div>
  );
};

export default Votes;