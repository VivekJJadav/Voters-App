"use client";

import { useEffect, useMemo, useState } from "react";
import SelectorForm from "@/components/SelectorForm";
import useGetVotes from "@/app/actions/useGetVotes";
import { useSelectedOrganization } from "@/context/SelectedOrganizationContext";
import Votes from "../components/Votes";
import LoadingSpinner from "@/components/LoadingSpinner";
import useGetUserMemberships from "@/app/actions/useGetUserMemberships";

const Vote = () => {
  const [votesError, setVotesError] = useState<string | null>(null);
  const { organizations, organizationsLoading } = useGetUserMemberships();
  const { selectedOrgId, setSelectedOrgId } = useSelectedOrganization();

  const validOrganizationId = useMemo(() => {
    if (!organizations?.length) return undefined;
    if (selectedOrgId && organizations.some((org) => org.id === selectedOrgId)) {
      return selectedOrgId;
    }
    return organizations[0].id;
  }, [organizations, selectedOrgId]);

  useEffect(() => {
    if (!organizationsLoading && organizations?.length > 0 && validOrganizationId) {
      if (validOrganizationId !== selectedOrgId) {
        setSelectedOrgId(validOrganizationId);
      }
    }
  }, [organizations, organizationsLoading, validOrganizationId, selectedOrgId, setSelectedOrgId]);

  const { votes, loading: votesLoading } = useGetVotes(selectedOrgId || "");

  useEffect(() => {
    if (votesLoading) {
      setVotesError(null);
    }
  }, [votesLoading]);

  if (votesError) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center px-4 pt-28 md:pt-32">
        <p className="text-red-500 text-center">Error: {votesError}</p>
      </div>
    );
  }

  if (organizationsLoading || votesLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center pt-28 md:pt-32">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (organizations.length === 0) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center px-4 pt-28 md:pt-32">
        <p className="text-center">You are not a member of any organization.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="px-4 md:px-6 mt-20 md:mt-20 py-4 flex flex-col fixed w-full bg-white z-50 border-b shadow-sm">
        <SelectorForm
          values={organizations}
          placeholder="Select an organization"
          loading={organizationsLoading}
          value={selectedOrgId}
          onChange={(newValue) => {
            setSelectedOrgId(newValue);
          }}
        />
      </div>
      <div className="px-4 md:px-16 lg:px-20 mt-48 md:mt-52">
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${
          votes.length > 2 ? 'justify-items-center' : ''
        }`}>
          {votes.map((vote) => (
            <Votes currentVote={vote} key={vote.id} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Vote;