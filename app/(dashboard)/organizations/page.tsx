"use client";

import NewVotingDialog from "@/components/NewVotingDialog";

const Organization = () => {
  return (
    <div className="w-full h-full">
      <div className="py-2 px-2">
        <NewVotingDialog label="Create a new voting"/>
      </div>
    </div>
  );
};

export default Organization;
