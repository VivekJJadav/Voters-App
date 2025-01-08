"use client";

import NewOrganizationDialog from "@/components/NewOrganizationDialog";
import NewVotingDialog from "@/components/NewVotingDialog";
import SelectorForm from "@/components/SelectorForm";
import useGetOrganizations from "@/app/actions/useGetOrganizations";
import useGetVotes from "@/app/actions/useGetVotes";
import { useSelectedOrganization } from "@/context/SelectedOrganizationContext";
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
  const { organizations } = useGetOrganizations();

  const { selectedOrgId } = useSelectedOrganization();

  const { votes } = useGetVotes(selectedOrgId || "")

  return (
    <div className="flex flex-col">
      <div className="py-2 px-2 mt-28 flex flex-col sm:flex-row sm:space-x-2 fixed w-full bg-white">
        <NewVotingDialog label="Create your own voting" />
        <NewOrganizationDialog label="Create new organization" />
        <SelectorForm
          values={organizations}
          placeholder="Select a organization"
        />
      </div>
      <div className="ml-[80px] mr-[80px] mt-[220px] lg:mt-[200px] md:mt-[200px] flex flex-wrap gap-4">
        {votes.map((vote) => (
          <Votes vote={vote}/>
        ))}
      </div>
    </div>
  );
};

export default Vote;
