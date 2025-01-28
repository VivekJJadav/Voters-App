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
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { MdOutlineDelete } from "react-icons/md";

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
      <div className="flex items-center justify-center mt-48">
        <p>Please select organization.</p>
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
    <div className="flex flex-col space-y-4 p-2 sm:p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div className="flex flex-wrap gap-2">
          <AddMembersDialog organizationId={orgId} />
          <NewDepartmentDialog
            label="Create a new department"
            organizationId={currentOrg.id}
            onSuccess={handleNewDepartment}
            departments={departments}
          />
        </div>

        <div className="text-center text-base sm:text-lg font-medium text-gray-700 my-2 sm:my-0">
          {currentOrg.name}
        </div>

        <div className="flex space-x-2">
          <NewVotingDialog label="create a vote" onVoteCreated={refreshVotes} />
          <Button
            variant="outline"
            className="text-xs sm:text-sm flex-1 sm:flex-none"
          >
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={() => onDelete(currentOrg.id)}
            disabled={isLoading}
            className="sm:text-sm flex-1 sm:flex-none"
          >
            {isLoading ? (
              <MdOutlineDelete className="bg-red-500" />
            ) : (
              <MdOutlineDelete />
            )}
          </Button>
        </div>
      </div>

      <div className="mt-2 sm:mt-4 p-3 sm:p-4 bg-gray-100 border border-gray-300 rounded-lg">
        <div className="space-y-3 sm:space-y-4 border-b pb-4">
          <button
            onClick={() => setIsMembersExpanded(!isMembersExpanded)}
            className="w-full flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-all duration-200 ease-in-out"
          >
            <h2 className="text-base sm:text-lg font-semibold">
              Members ({voters.length})
            </h2>
            <ChevronDown
              className={`h-5 w-5 text-gray-500 transform transition-transform duration-200 ${
                isMembersExpanded ? "rotate-180" : ""
              }`}
            />
          </button>

          {isMembersExpanded && (
            <div className="space-y-4 mt-4">
              {votersLoading ? (
                <div className="flex justify-center py-4">
                  <LoadingSpinner size="sm" />
                </div>
              ) : voters.length === 0 ? (
                <p className="text-sm sm:text-base text-gray-500 text-center">
                  No members in this organization yet.
                </p>
              ) : (
                <div className="grid gap-2 sm:gap-3">
                  {voters.map((voter, index) => (
                    <div
                      key={voter.id}
                      className="p-3 sm:p-4 bg-white rounded-lg border border-gray-200 shadow-sm 
                        hover:shadow-md transition-all duration-200 ease-in-out
                        transform hover:-translate-y-0.5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-1">
                          <p className="text-sm sm:text-base font-medium text-gray-900">
                            {voter.name}
                          </p>
                          <p className="text-sm text-gray-600">{voter.email}</p>
                        </div>
                        {voter.departments?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 sm:gap-2">
                            {voter.departments
                              .filter(
                                (dept: any) => dept.organizationId === orgId
                              )
                              .map((dept: any) => (
                                <span
                                  key={dept.id}
                                  className="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full
                                    hover:bg-gray-200 transition-colors duration-200"
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

        <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 mt-3">
          Departments
        </h2>

        {!departmentsLoading ? (
          <div className="space-y-2">
            {departments.length !== 0 ? (
              <DepartmentTag
                departments={departments}
                handleDeleteDepartment={handleDeleteDepartment}
                organizationId={currentOrg.id}
              />
            ) : (
              <p className="text-sm sm:text-base">
                No departments are available. Please create one to conduct
                voting.
              </p>
            )}
          </div>
        ) : (
          <div className="flex justify-center py-4">
            <LoadingSpinner size="sm" />
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizationPage;
