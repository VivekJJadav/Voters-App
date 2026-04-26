"use client";

import { useEffect, useMemo, useState } from "react";
import SelectorForm from "@/components/SelectorForm";
import useGetVotes from "@/app/actions/useGetVotes";
import { useSelectedOrganization } from "@/context/SelectedOrganizationContext";
import Votes from "../components/Votes";
import LoadingSpinner from "@/components/LoadingSpinner";
import useGetUserMemberships from "@/app/actions/useGetUserMemberships";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, CalendarClock, VoteIcon } from "lucide-react";
import { useRouter } from "next/navigation";

const Vote = () => {
  const router = useRouter();
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

  const activeOrganizationId = selectedOrgId || validOrganizationId || "";
  const selectedOrganization = useMemo(
    () => organizations.find((org) => org.id === activeOrganizationId),
    [organizations, activeOrganizationId]
  );

  useEffect(() => {
    if (!organizationsLoading && organizations?.length > 0 && validOrganizationId) {
      if (validOrganizationId !== selectedOrgId) {
        setSelectedOrgId(validOrganizationId);
      }
    }
  }, [organizations, organizationsLoading, validOrganizationId, selectedOrgId, setSelectedOrgId]);

  const { votes, loading: votesLoading } = useGetVotes(activeOrganizationId);
  const { liveVotes, upcomingVotes, endedVotes } = useMemo(() => {
    const now = new Date();

    return votes.reduce(
      (groups, vote) => {
        const startTime = new Date(vote.startTime);
        const effectiveEndTime = vote.extendedTime || vote.endTime;
        const endTime = effectiveEndTime ? new Date(effectiveEndTime) : null;

        if (startTime > now) {
          groups.upcomingVotes.push(vote);
        } else if (!endTime || endTime > now) {
          groups.liveVotes.push(vote);
        } else {
          groups.endedVotes.push(vote);
        }

        return groups;
      },
      {
        liveVotes: [] as typeof votes,
        upcomingVotes: [] as typeof votes,
        endedVotes: [] as typeof votes,
      }
    );
  }, [votes]);

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
        <Card className="max-w-md rounded-lg shadow-sm">
          <CardContent className="p-8 text-center">
            <VoteIcon className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium text-gray-900">No votes yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Votes will appear here after you join a voting space through an
              invitation link.
            </p>
            <Button
              variant="outline"
              className="mt-5"
              onClick={() => router.push("/settings")}
            >
              Account settings
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="px-4 md:px-6 mt-20 md:mt-20 py-4 flex flex-col fixed w-full bg-white z-50 border-b shadow-sm">
        <SelectorForm
          values={organizations}
          placeholder="Select a voting space"
          loading={organizationsLoading}
          value={selectedOrgId}
          onChange={(newValue) => {
            setSelectedOrgId(newValue);
          }}
        />
      </div>
      <div className="px-4 md:px-16 lg:px-20 mt-48 md:mt-52 pb-12">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-white">Your votes</h1>
          <p className="mt-1 text-sm text-white/60">
            {selectedOrganization
              ? `Open votes from ${selectedOrganization.name} are shown first.`
              : "Open votes from your selected voting space are shown first."}
          </p>
        </div>

        {liveVotes.length === 0 ? (
          <Card className="max-w-md mx-auto rounded-lg shadow-sm">
            <CardContent className="p-8 text-center">
              <VoteIcon className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium text-gray-900">
                No active votes right now
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                When a vote opens in this space, it will appear here.
              </p>
              {endedVotes.length > 0 && (
                <Button
                  variant="outline"
                  className="mt-5"
                  onClick={() => router.push("/results")}
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View results
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${
            liveVotes.length > 2 ? 'justify-items-center' : ''
          }`}>
            {liveVotes.map((vote) => (
              <Votes currentVote={vote} key={vote.id} />
            ))}
          </div>
        )}

        {upcomingVotes.length > 0 && (
          <section className="mt-10">
            <div className="mb-4 flex items-center gap-2 text-white">
              <CalendarClock className="h-5 w-5 text-sky-200" />
              <h2 className="text-lg font-semibold">Upcoming votes</h2>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {upcomingVotes.map((vote) => (
                <Votes currentVote={vote} key={vote.id} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Vote;
