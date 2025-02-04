"use client";

import NewOrganizationDialog from "@/components/NewOrganizationDialog";
import useGetOrganizations from "@/app/actions/useGetOrganizations";
import OrganizationPage from "../components/OrganizationPage";
import SelectorForm from "@/components/SelectorForm";
import OrganizationTag from "../components/OrganizationTag";
import { useSelectedOrganization } from "@/context/SelectedOrganizationContext";
import LoadingSpinner from "@/components/LoadingSpinner";

const Organization = () => {
  const { organizations, loading, error, handleNewOrganization } =
    useGetOrganizations();

  const { selectedOrgId } = useSelectedOrganization();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // For empty state with no organizations
  if (organizations.length === 0) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <NewOrganizationDialog
          label="Create a new organization"
          onSuccess={(Org) => handleNewOrganization(Org)}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="fixed top-0 bg-white z-10 py-1 px-4">
        <div className="mt-28 flex">
          <NewOrganizationDialog
            label="Create a new organization"
            onSuccess={(Org) => handleNewOrganization(Org)}
          />
          <div className="lg:w-60 w-full z-50 px-4 lg:hidden md:hidden">
            <SelectorForm
              values={organizations}
              placeholder="Select an organization"
              loading={loading}
            />
          </div>
        </div>
      </div>
      <div className="flex mt-28 fixed w-full">
        <div className="hidden h-[calc(100vh-190px)] md:block w-1/5 px-4 overflow-y-auto mt-16">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ul className="space-y-2">
              {organizations.map((org) => (
                <OrganizationTag org={org} key={org.id} />
              ))}
            </ul>
          )}
        </div>
        <div className="w-full md:w-4/5 bg-gray-100 p-4 rounded-lg mr-3">
          {selectedOrgId ? (
            <OrganizationPage orgId={selectedOrgId} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Please select an organization
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Organization;
