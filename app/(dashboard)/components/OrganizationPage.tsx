"use client";

import React, { useState } from "react";
import useGetDepartments from "@/app/actions/useGetDepartments";
import useGetOrganizations from "@/app/actions/useGetOrganizations";
import useGetVoters from "@/app/actions/useGetVoters";
import useGetVotes from "@/app/actions/useGetVotes";
import NewDepartmentDialog from "@/components/NewDepartmentDialog";
import AddMembersDialog from "@/components/AddMemberDialog";
import DepartmentTag from "./Department";
import LoadingSpinner from "@/components/LoadingSpinner";
import NewVotingDialog from "@/components/NewVotingDialog";
import { Button } from "@/components/ui/button";
import { ChevronDown, Pencil, Plus, Trash2, Users, Vote } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface OrganizationPageProps {
  orgId: string;
}

const OrganizationPage = ({ orgId }: OrganizationPageProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isMembersExpanded, setIsMembersExpanded] = useState(true);
  const [isDepartmentsExpanded, setIsDepartmentsExpanded] = useState(true);

  const { organizations, handleDeleteOrganization } = useGetOrganizations();
  const {
    departments,
    handleNewDepartment,
    handleDeleteDepartment,
    loading: departmentsLoading,
  } = useGetDepartments(orgId);
  const { voters, votersLoading } = useGetVoters(orgId);
  const { refreshVotes } = useGetVotes(orgId);

  const currentOrg = organizations.find((org) => org.id === orgId);

  if (!currentOrg) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <p className="text-muted-foreground/80 text-lg font-light">
          Select an organization to begin
        </p>
      </div>
    );
  }

  const onDelete = async (organizationId: string) => {
    if (!organizationId) {
      toast.error("Organization ID is required");
      return;
    }

    setIsLoading(true);
    try {
      await handleDeleteOrganization(organizationId);
      toast.success("Organization deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete organization");
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70">
            {currentOrg.name}
          </h1>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="font-normal">
              {departments.length} Departments
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <NewVotingDialog label="New Vote" />

          <AddMembersDialog organizationId={orgId} />

          <NewDepartmentDialog
            label="Create a new department"
            organizationId={currentOrg.id}
            onSuccess={handleNewDepartment}
            departments={departments}
          />
        </div>
      </div>

      {/* Content Section */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Departments Section (Now takes 2/3 of the space) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() =>
                    setIsDepartmentsExpanded(!isDepartmentsExpanded)
                  }
                  className="flex items-center gap-2 group"
                >
                  <div className="space-y-1 text-left">
                    <CardTitle className="text-2xl">Departments</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {departments.length} active{" "}
                      {departments.length === 1 ? "department" : "departments"}
                    </p>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 text-muted-foreground transition-transform duration-300",
                      isDepartmentsExpanded ? "rotate-180" : ""
                    )}
                  />
                </button>
                <div className="flex items-center gap-2">
                  <NewDepartmentDialog
                    label="Create a new Department"
                    organizationId={currentOrg.id}
                    onSuccess={handleNewDepartment}
                    departments={departments}
                  />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() => onDelete(currentOrg.id)}
                        disabled={isLoading}
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">
                        Delete organization and all departments
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </CardHeader>

            {isDepartmentsExpanded && (
              <>
                <Separator className="mb-4" />
                <CardContent>
                  {departmentsLoading ? (
                    <div className="flex justify-center py-8">
                      <LoadingSpinner size="md" />
                    </div>
                  ) : departments.length === 0 ? (
                    <div className="flex flex-col items-center gap-4 text-center p-8 rounded-xl bg-muted/20">
                      <Users className="h-12 w-12 text-muted-foreground/40" />
                      <div className="space-y-2">
                        <p className="text-muted-foreground font-medium">
                          No departments yet
                        </p>
                        <p className="text-sm text-muted-foreground/80">
                          Create departments to organize your members and manage
                          voting groups
                        </p>
                      </div>
                      <NewDepartmentDialog
                        label="Create your first department"
                        organizationId={currentOrg.id}
                        onSuccess={handleNewDepartment}
                        departments={departments}
                      />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <DepartmentTag
                        departments={departments}
                        handleDeleteDepartment={handleDeleteDepartment}
                        organizationId={currentOrg.id}
                      />
                    </div>
                  )}
                </CardContent>
              </>
            )}
          </Card>
        </div>

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
                    <LoadingSpinner size="md" />
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
                              .filter(
                                (dept: any) => dept.organizationId === orgId
                              )
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
      </div>
    </div>
  );
};

export default OrganizationPage;
