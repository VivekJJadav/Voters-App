"use client";

import NewOrganizationDialog from "@/components/NewOrganizationDialog";
import NewVotingDialog from "@/components/NewVotingDialog";
import SelectorForm from "@/components/SelectorForm";
import useGetOrganizations from "@/app/actions/useGetOrganizations";
import useGetVotes from "@/app/actions/useGetVotes";
import { useSelectedOrganization } from "@/context/SelectedOrganizationContext";
import Votes from "../components/Votes";
import LoadingSpinner from "@/components/LoadingSpinner";
import useGetUserMemberships from "@/app/actions/useGetUserMemberships";

const Vote = () => {
  const { organizations, organizationsLoading } = useGetUserMemberships();

  const { selectedOrgId } = useSelectedOrganization();

  const { votes, loading } = useGetVotes(selectedOrgId || "");

  return (
    <div className="flex flex-col">
      <div className="py-2 px-2 mt-28 flex flex-col sm:flex-row sm:space-x-2 fixed w-full bg-white">
        {/* <NewVotingDialog
          label="Create your own voting"
          onVoteCreated={refreshVotes}
        /> */}
        {/* <NewOrganizationDialog label="Create new organization" /> */}
        <SelectorForm
          values={organizations}
          placeholder="Select a organization"
          loading={organizationsLoading}
        />
      </div>
      <div className="ml-[80px] mr-[80px] mt-[220px] lg:mt-[200px] md:mt-[200px] flex flex-wrap gap-4">
        {loading ? (
          <div className="fixed inset-0 flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : votes.length === 0 ? (
          <div className="w-full text-center">No votes found</div>
        ) : (
          votes.map((vote) => <Votes vote={vote} key={vote.id} />)
        )}
      </div>
    </div>
  );
};

export default Vote;
