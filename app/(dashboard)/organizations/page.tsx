"use client";

import NewOrganizationDialog from "@/components/NewOrganizationDialog";
import useGetOrganizations from "@/app/actions/useGetOrganizations";
import { useState } from "react";
import OrganizationPage from "../components/OrganizationPage";

const Organization = () => {
  const { organizations, loading, error, handleNewOrganization } =
    useGetOrganizations();
  const [orgId, setOrgId] = useState("Your Organization");

  const handleClick = (orgId: string) => {
    setOrgId(orgId);
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="fixed top-0 w-full bg-white z-10 py-2 px-4">
        <div className="mt-44">
          <NewOrganizationDialog
            label="Create a new organization"
            onSuccess={(Org) => handleNewOrganization(Org)}
          />
        </div>
      </div>
      <div className="flex mt-60 h-[calc(100vh-240px)] fixed w-full">
        <div className="hidden md:block w-1/5 px-2 overflow-y-auto">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ul className="space-y-2">
              {organizations.map((org) => (
                <li
                  key={org.id}
                  className="p-4 border-gray-400 border-[1px] rounded-lg hover:shadow-md transition-shadow duration-200 cursor-pointer"
                  onClick={() => handleClick(org.id)}
                >
                  <h3 className="font-medium">{org.name}</h3>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="w-full md:w-4/5 overflow-y-auto bg-gray-100 p-4">
          <OrganizationPage orgId={orgId} />
        </div>
      </div>
    </div>
  );
};

export default Organization;
