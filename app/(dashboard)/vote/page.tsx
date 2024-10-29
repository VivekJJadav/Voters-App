"use client";

import NewOrganizationDialog from "@/components/NewOrganizationDialog";
import NewVotingDialog from "@/components/NewVotingDialog";
import Votes from "../components/Votes";

const votes = [
  {
    name: "Election 1",
    description:
      "We want winner 1 We want winner 1We want winner 1We want winner 1We want winner 1We want winner 1We want winner 1We want winner 1We want winner 1We want winner 1We want winner 1We want winner 1We want winner 1We want winner 1We want winner 1We want winner 1We want winner 1We want winner 1We want winner 1We want winner 1We want winner 1We want winner 1We want winner 1We want winner 1We want winner 1We want winner 1We want winner 1We want winner 1We want winner 1We want winner 1We want winner 1We want winner 1We want winner 1We want winner 1We want winner 1",
    isActive: true,
  },
  {
    name: "Election 2",
    description: "We want winner 2",
    isActive: true,
  },
  {
    name: "Election 3",
    description: "We want winner 3",
    isActive: false,
  },
  {
    name: "Election 4",
    description: "We want winner 4",
    isActive: false,
  },
  {
    name: "Election 5",
    description: "We want winner 5",
    isActive: true,
  },
];

const Vote = () => {
  return (
    <div className="flex flex-col">
      <div className="py-2 px-2 mt-44 flex flex-col sm:flex-row sm:space-x-2 fixed w-full bg-white">
        <NewVotingDialog label="Create your own voting" />
        <NewOrganizationDialog label="Create new organization" />
      </div>
      <div className="ml-[80px] mr-[80px] mt-[280px] lg:mt-[235px] md:mt-[235px] flex flex-wrap gap-4">
        {votes.map((vote) => (
          <Votes vote={vote} />
        ))}
      </div>
    </div>
  );
};

export default Vote;
