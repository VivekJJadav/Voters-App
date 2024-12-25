import useGetDepartments from "@/app/actions/useGetDepartments";
import useGetOrganizations from "@/app/actions/useGetOrganizations";
import NewDepartmentDialog from "@/components/NewDepartmentDialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import Department from "./Department";

interface OrganizationPageProps {
  orgId: string;
}

const OrganizationPage = ({ orgId }: OrganizationPageProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { organizations, handleDeleteOrganization } = useGetOrganizations();
  const { departments, handleNewDepartment, handleDeleteDepartment, loading } =
    useGetDepartments(orgId);

  const currentOrg = organizations.find((org) => org.id === orgId);

  if (!currentOrg) {
    return (
      <div className="flex items-center justify-center p-4">
        <p className="text-gray-500">Organization not found</p>
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
    <div className="flex flex-col space-y-4 p-4">
      <div className="flex items-center justify-between">
        <NewDepartmentDialog
          label="Create a new department"
          organizationId={currentOrg.id}
          onSuccess={handleNewDepartment}
          departments={departments}
        />
        <div className="flex-1 text-center text-lg font-medium text-gray-700">
          {currentOrg.name}
        </div>
        <div className="ml-auto space-x-2">
          <Button
            variant="outline"
            className="text-sm px-2 py-1 sm:px-4 sm:py-2 sm:text-base"
          >
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={() => onDelete(currentOrg.id)}
            disabled={isLoading}
            className="text-sm px-2 py-1 sm:px-4 sm:py-2 sm:text-base"
          >
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
      <div className="mt-4 p-4 bg-gray-100 border border-gray-300 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Departments</h2>
        {!loading ? (
          <div className="space-y-2">
            {departments.length !== 0 ? (
              departments.map((dep) => (
                <Department
                  key={dep.id}
                  handleDeleteDepartment={handleDeleteDepartment}
                  dep={dep}
                />
              ))
            ) : (
              <p>
                No departments are available. Please create one to conduct
                voting.
              </p>
            )}
          </div>
        ) : (
          <p>Loading departments...</p>
        )}
      </div>
    </div>
  );
};

export default OrganizationPage;
