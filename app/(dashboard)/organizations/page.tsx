"use client";

import NewOrganizationDialog from "@/components/NewOrganizationDialog";

import useGetOrganizations from "@/app/actions/useGetOrganizations";

const Organization = () => {
  const { organizations, loading, error, handleNewOrganization } =
    useGetOrganizations();

  return (
    <div className="w-full h-full">
      <div className="py-2 px-2 mt-44 flex flex-col sm:flex-row sm:space-x-2 fixed w-full bg-white">
        <NewOrganizationDialog
          label="Create a new organization"
          onSuccess={(Org) => handleNewOrganization(Org)}
        />
        <ul className="space-y-2">
          {" "}
          {organizations.map((org) => (
            <li
              key={org.id}
              className="p-4 border rounded hover:shadow-md transition-shadow duration-200"
            >
              <h3 className="font-medium">{org.name}</h3>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Organization;
