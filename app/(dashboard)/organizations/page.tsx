"use client";

import NewOrganizationDialog from "@/components/NewOrganizationDialog";

const Organization = () => {
  return (
    <div className="w-full h-full">
      <div className="py-2 px-2 mt-44 flex flex-col sm:flex-row sm:space-x-2 fixed w-full bg-white">
        <NewOrganizationDialog label="Create a new organization"/>
      </div>
    </div>
  );
};

export default Organization;
