"use client";

import { useEffect, useMemo, useState } from "react";
import SelectorForm from "@/components/SelectorForm";
import useGetVotes from "@/app/actions/useGetVotes";
import { useSelectedOrganization } from "@/context/SelectedOrganizationContext";
import LoadingSpinner from "@/components/LoadingSpinner";
import useGetUserMemberships from "@/app/actions/useGetUserMemberships";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Calendar } from "lucide-react";
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
      <div className="min-h-screen w-full flex items-center justify-center p-4 mt-24">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <p className="text-red-500 text-center">Error: {votesError}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (organizationsLoading || votesLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (organizations.length === 0) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <p className="text-center text-gray-600">You are not a member of any organization.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="fixed top-20 left-0 right-0 bg-white border-b z-40 px-4 py-4 md:px-6">
        <div className="max-w-3xl mx-auto">
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
      </div>

      <div className="max-w-3xl mx-auto w-full px-4 md:px-6 pb-8 space-y-4 pt-44">
        {votes.map((vote) => (
          <Card 
            key={vote.id} 
            className="hover:shadow-md transition-all duration-200 cursor-pointer border-gray-200"
            onClick={() => router.push(`/results/${vote.id}`)}
          >
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2 truncate">
                    {vote.name}
                  </h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>
                      {new Date(vote.startTime).toLocaleDateString()} - 
                      {vote.endTime ? new Date(vote.endTime).toLocaleDateString() : "Ongoing"}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Vote;