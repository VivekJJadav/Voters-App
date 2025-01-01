"use client";

import NewOrganizationDialog from "@/components/NewOrganizationDialog";
import useGetOrganizations from "@/app/actions/useGetOrganizations";
import OrganizationPage from "../components/OrganizationPage";
import SelectorForm from "@/components/SelectorForm";
import OrganizationTag from "../components/OrganizationTag";
import { useSelectedOrganization } from "@/context/SelectedOrganizationContext";

const Organization = () => {
  const { organizations, loading, error, handleNewOrganization } =
    useGetOrganizations();

  const { selectedOrgId } = useSelectedOrganization();

  return (
    <div className="flex flex-col h-screen">
      <div className="fixed top-0 w-full bg-white z-10 py-2 px-4">
        {organizations.length === 0 ? (
          <div className="mt-[390px] flex items-center justify-center">
            <NewOrganizationDialog
              label="Create a new organization"
              onSuccess={(Org) => handleNewOrganization(Org)}
            />
          </div>
        ) : (
          <div className="mt-28 flex">
            <NewOrganizationDialog
              label="Create a new organization"
              onSuccess={(Org) => handleNewOrganization(Org)}
            />
            <div className="lg:w-60 w-full z-50 px-4 lg:hidden md:hidden">
              <SelectorForm
                values={organizations}
                placeholder="Select an organization"
              />
            </div>
          </div>
        )}
      </div>
      <div className="flex mt-44 h-[calc(100vh-190px)] fixed w-full">
        <div className="hidden md:block w-1/5 px-2 overflow-y-auto">
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
        {organizations.length !== 0 && (
          <div className="w-full md:w-4/5 overflow-y-auto bg-gray-100 p-4 rounded-lg mr-3">
            {selectedOrgId ? (
              <OrganizationPage orgId={selectedOrgId} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Please select an organization
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Organization;
