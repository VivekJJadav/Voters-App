"use client";

import NewOrganizationDialog from "@/components/NewOrganizationDialog";
import useGetOrganizations from "@/app/actions/useGetOrganizations";
import OrganizationPage from "../components/OrganizationPage";
import { cn } from "@/lib/utils";
import { useSelectedOrganization } from "@/context/SelectedOrganizationContext";
import SelectorForm from "@/components/SelectorForm";

const Organization = () => {
  const { organizations, loading, error, handleNewOrganization } =
    useGetOrganizations();
  const { selectedOrgId, setSelectedOrgId } = useSelectedOrganization();

  const handleClick = (orgId: string) => {
    setSelectedOrgId(orgId);
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="fixed top-0 w-full bg-white z-10 py-2 px-4">
        <div className="mt-28 flex">
          <NewOrganizationDialog
            label="Create a new organization"
            onSuccess={(Org) => handleNewOrganization(Org)}
          />
          {/* <div className="lg:w-60 w-full z-50 px-4">
            <SelectorForm
              values={organizations}
              placeholder="Select an organization"
            />
          </div> */}
        </div>
      </div>
      <div className="flex mt-44 h-[calc(100vh-190px)] fixed w-full">
        <div className="hidden md:block w-1/5 px-2 overflow-y-auto">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ul className="space-y-2">
              {organizations.map((org) => (
                <li
                  key={org.id}
                  className={cn(
                    "p-4 border-gray-400 border-[1px] rounded-lg hover:shadow-md transition-shadow duration-200 cursor-pointer",
                    selectedOrgId === org.id
                      ? "bg-gray-600 text-white shadow-md"
                      : "bg-white"
                  )}
                  onClick={() => handleClick(org.id)}
                >
                  <h3 className="font-medium">{org.name}</h3>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="w-full md:w-4/5 overflow-y-auto bg-gray-100 p-4 rounded-lg mr-3">
          <OrganizationPage orgId={selectedOrgId || "Your Organization"} />
        </div>
      </div>
    </div>
  );
};

export default Organization;
