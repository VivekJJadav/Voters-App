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
import { ChevronDown, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface OrganizationPageProps {
  orgId: string;
}

const OrganizationPage = ({ orgId }: OrganizationPageProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isMembersExpanded, setIsMembersExpanded] = useState(false);

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
        <p className="text-neutral-500 text-lg">
          Please select an organization
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
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="flex flex-wrap gap-3">
          <AddMembersDialog organizationId={orgId} />
          <NewDepartmentDialog
            label="Create a new department"
            organizationId={currentOrg.id}
            onSuccess={handleNewDepartment}
            departments={departments}
          />
        </div>

        <h1 className="text-3xl font-bold text-neutral-900">
          {currentOrg.name}
        </h1>

        <div className="flex items-center gap-3">
          <NewVotingDialog label="Create a vote" onVoteCreated={refreshVotes} />
          <Button
            variant="outline"
            size="sm"
            className="text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 border-neutral-200 transition-all"
          >
            <Pencil className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(currentOrg.id)}
            disabled={isLoading}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 transition-all"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Members Section */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-lg overflow-hidden">
        <div className="border-b border-neutral-200">
          <button
            onClick={() => setIsMembersExpanded(!isMembersExpanded)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-neutral-50 transition-all"
          >
            <h2 className="text-xl font-semibold text-neutral-900">
              Members ({voters.length})
            </h2>
            <ChevronDown
              className={`h-5 w-5 text-neutral-400 transform transition-transform duration-200 ${
                isMembersExpanded ? "rotate-180" : ""
              }`}
            />
          </button>

          {isMembersExpanded && (
            <div className="px-6 py-4 space-y-4">
              {votersLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="sm" />
                </div>
              ) : voters.length === 0 ? (
                <p className="text-center text-neutral-500 py-8">
                  No members in this organization yet.
                </p>
              ) : (
                <div className="grid gap-3">
                  {voters.map((voter) => (
                    <div
                      key={voter.id}
                      className="p-4 rounded-lg bg-neutral-50 hover:bg-neutral-100 
                        transition-all duration-200 group shadow-sm"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <p className="font-medium text-neutral-900">
                            {voter.name}
                          </p>
                          <p className="text-sm text-neutral-500">
                            {voter.email}
                          </p>
                        </div>
                        {voter.departments?.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {voter.departments
                              .filter(
                                (dept: any) => dept.organizationId === orgId
                              )
                              .map((dept: any) => (
                                <span
                                  key={dept.id}
                                  className="px-3 py-1 text-xs font-medium bg-white text-neutral-600 
                                    rounded-full border border-neutral-200 shadow-sm 
                                    group-hover:border-neutral-300 transition-all"
                                >
                                  {dept.name}
                                </span>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Departments Section */}
        <div className="px-6 py-4">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">
            Departments
          </h2>

          {departmentsLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="sm" />
            </div>
          ) : departments.length === 0 ? (
            <p className="text-center text-neutral-500 py-8">
              No departments are available. Please create one to conduct voting.
            </p>
          ) : (
            <div className="space-y-3">
              <DepartmentTag
                departments={departments}
                handleDeleteDepartment={handleDeleteDepartment}
                organizationId={currentOrg.id}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrganizationPage;
