import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type vote = {
  name: string;
  description: string;
  isActive: boolean;
};

interface VoteContainerProps {
  vote: vote;
}

const VoteContainer = ({ vote }: VoteContainerProps) => {
  return (
    <div className="w-full relative">
      <div className="pl-3 pt-2 font-semibold text-lg flex justify-between">
        <h1>{vote.name}</h1>
        <div className="pr-3 pt-2">
          <div
            className={cn(
              "w-3 h-3 border-2 rounded-full",
              vote.isActive
                ? "bg-green-600 border-green-400 hover:bg-green-700 hover:border-green-500"
                : "bg-red-600 border-red-400 hover:bg-red-800 hover:border-red-600"
            )}
          ></div>
        </div>
      </div>
      <div className="pl-4 pt-3">
        <p className="text-sm text-left text-muted-foreground line-clamp-3">
          {vote.description}
        </p>
      </div>
      <div className="absolute bottom-2 right-2">
        <Button className="bg-gray-600">Vote</Button>
      </div>
    </div>
  );
};

export default VoteContainer;
