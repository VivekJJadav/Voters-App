"use client";

import { useEffect, useMemo } from "react";
import SelectorForm from "@/components/SelectorForm";
import useGetVotes from "@/app/actions/useGetVotes";
import { useSelectedOrganization } from "@/context/SelectedOrganizationContext";
import Votes from "../components/Votes";
import LoadingSpinner from "@/components/LoadingSpinner";
import useGetUserMemberships from "@/app/actions/useGetUserMemberships";

const Vote = () => {
  const { organizations, organizationsLoading } = useGetUserMemberships();
  const { selectedOrgId, setSelectedOrgId } = useSelectedOrganization();

  const validOrganizationId = useMemo(() => {
    if (!organizations?.length) return undefined;
    if (
      selectedOrgId &&
      organizations.some((org) => org.id === selectedOrgId)
    ) {
      return selectedOrgId;
    }
    return organizations[0].id;
  }, [organizations, selectedOrgId]);

  useEffect(() => {
    if (
      !organizationsLoading &&
      organizations?.length > 0 &&
      validOrganizationId
    ) {
      if (validOrganizationId !== selectedOrgId) {
        setSelectedOrgId(validOrganizationId);
      }
    }
  }, [
    organizations,
    organizationsLoading,
    validOrganizationId,
    selectedOrgId,
    setSelectedOrgId,
  ]);

  const { votes, loading: votesLoading } = useGetVotes(selectedOrgId || "");

  return (
    <div className="flex flex-col">
      <div className="px-2 mt-24 py-6 pl-6 flex flex-col sm:flex-row sm:space-x-2 fixed w-full bg-white z-50">
        <SelectorForm
          values={organizations}
          placeholder="Select a organization"
          loading={organizationsLoading}
          value={selectedOrgId}
          onChange={(newValue) => {
            setSelectedOrgId(newValue);
          }}
        />
      </div>
      {votes.length < 3 ? (
        <div className="ml-[80px] mr-[80px] mt-[220px] lg:mt-[200px] md:mt-[200px] flex flex-wrap">
          {votesLoading ? (
            <div className="h-screen w-full flex items-center justify-center">
              <LoadingSpinner size="lg" />
            </div>
          ) : votes.length === 0 ? (
            <div className="w-full text-center">No votes found</div>
          ) : (
            votes.map((vote) => <Votes currentVote={vote} key={vote.id} />)
          )}
        </div>
      ) : (
        <div className="ml-[80px] mr-[80px] mt-[220px] lg:mt-[200px] md:mt-[200px] flex flex-wrap justify-around">
          {votesLoading ? (
            <div className="h-screen w-full flex items-center justify-center">
              <LoadingSpinner size="lg" />
            </div>
          ) : votes.length === 0 ? (
            <div className="w-full text-center">No votes found</div>
          ) : (
            votes.map((vote) => <Votes currentVote={vote} key={vote.id} />)
          )}
        </div>
      )}
    </div>
  );
};

export default Vote;
