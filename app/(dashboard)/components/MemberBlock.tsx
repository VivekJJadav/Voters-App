import { useState } from "react";
import useGetVoters from "@/app/actions/useGetVoters";

import LoadingSpinner from "@/components/LoadingSpinner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MemberBlockProps {
  orgId: string;
}

const MemberBlock = ({ orgId }: MemberBlockProps) => {
  const [isMembersExpanded, setIsMembersExpanded] = useState(true);

  const { voters, votersLoading } = useGetVoters(orgId);

  return (
    <div className="space-y-6">
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-0">
          <button
            onClick={() => setIsMembersExpanded(!isMembersExpanded)}
            className="w-full flex items-center justify-between group"
          >
            <div className="space-y-1">
              <CardTitle className="text-2xl">Members</CardTitle>
              <p className="text-muted-foreground text-sm font-light">
                {voters.length} registered members
              </p>
            </div>
            <ChevronDown
              className={cn(
                "h-6 w-6 text-muted-foreground transition-transform duration-300",
                isMembersExpanded ? "rotate-180" : ""
              )}
            />
          </button>
        </CardHeader>

        {isMembersExpanded && (
          <CardContent className="pt-6">
            {votersLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="sm" />
              </div>
            ) : voters.length === 0 ? (
              <div className="text-center p-8 rounded-xl bg-muted/20">
                <p className="text-muted-foreground/80">
                  No members found. Add members to get started.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {voters.map((voter) => (
                  <div
                    key={voter.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-card hover:bg-card/80 transition-colors border"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="border-2 border-primary/20">
                        <AvatarFallback className="bg-primary/10 text-primary/80">
                          {voter.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{voter.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {voter.email}
                        </p>
                      </div>
                    </div>
                    {voter.departments?.length > 0 && (
                      <div className="flex flex-wrap gap-2 max-w-[200px]">
                        {voter.departments
                          .filter((dept: any) => dept.organizationId === orgId)
                          .map((dept: any) => (
                            <Tooltip key={dept.id}>
                              <TooltipTrigger>
                                <Badge
                                  variant="outline"
                                  className="text-xs truncate max-w-[120px]"
                                >
                                  {dept.name}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{dept.fullPath}</p>
                              </TooltipContent>
                            </Tooltip>
                          ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default MemberBlock;
