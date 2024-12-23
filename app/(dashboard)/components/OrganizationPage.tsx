import useGetOrganizations from "@/app/actions/useGetOrganizations";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

interface OrganizationPageProps {
  orgId: string;
}

const OrganizationPage = ({ orgId }: OrganizationPageProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { organizations, handleDeleteOrganization } = useGetOrganizations();

  const currentOrg = organizations.find((org) => org.id === orgId);
  const orgName = currentOrg?.name || "Organization not found";

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
    <div className="flex items-center justify-between">
      <Button>Make a department</Button>
      <div className="flex-1 text-center text-lg font-medium text-gray-700">
        {orgName}
      </div>
      <div className="ml-auto space-x-2">
        <Button>Edit</Button>
        <Button onClick={() => onDelete(orgId)} disabled={isLoading}>
          {isLoading ? "Deleting..." : "Delete"}
        </Button>
      </div>
    </div>
  );
};

export default OrganizationPage;
