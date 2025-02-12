"use client";

import useGetDepartments from "@/app/actions/useGetDepartments";
import useGetOrganizations from "@/app/actions/useGetOrganizations";
import useGetVoters from "@/app/actions/useGetVoters";
import useGetVotes from "@/app/actions/useGetVotes";
import AddMembersDialog from "@/components/AddMemberDialog";
import NewVotingDialog from "@/components/NewVotingDialog";
import DepartmentBlock from "./DepartmentBlock";
import MemberBlock from "./MemberBlock";
import NewDepartmentDialog from "@/components/NewDepartmentDialog";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, ChevronRight, Delete, Trash2 } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BsThreeDotsVertical } from "react-icons/bs";
import axios from "axios";
import { toast } from "sonner";

interface OrganizationPageProps {
  orgId: string;
}

const OrganizationPage = ({ orgId }: OrganizationPageProps) => {
  const [activeTab, setActiveTab] = useState("votes");
  const { organizations, loading: organizationsLoading } = useGetOrganizations();
  const { departments, loading: departmentsLoading, handleNewDepartment } = useGetDepartments(orgId);
  const { voters } = useGetVoters(orgId);
  const { votes, deleteVote } = useGetVotes(orgId);

  if (organizationsLoading || departmentsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen pt-20">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  const currentOrg = organizations.find((org) => org.id === orgId);
  if (!currentOrg) {
    return (
      <div className="flex items-center justify-center min-h-screen pt-20">
        Select an organization to begin
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "votes":
        return (
          <div className="p-4 md:p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Active Votes</h2>
              <NewVotingDialog label="New vote" />
            </div>
            <div className="space-y-3">
              {votes.map((vote) => (
                <Card key={vote.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4 flex justify-between items-center">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{vote.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(vote.startTime).toLocaleDateString()}-
                        {vote.endTime ? new Date(vote.endTime).toLocaleDateString() : "Ongoing"}
                      </p>
                    </div>
                    <div className="ml-4">
                      <Trash2
                        className="w-5 h-5 text-red-600 cursor-pointer"
                        onClick={() => deleteVote(vote.id)}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      case "departments":
        return departments.length !== 0 ? (
          <div className="p-4 md:p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Departments</h2>
            </div>
            <div className="space-y-3">
              <DepartmentBlock orgId={orgId} />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
            <NewDepartmentDialog
              label="Create a new Department"
              organizationId={currentOrg.id}
              onSuccess={handleNewDepartment}
              departments={departments}
            />
          </div>
        );
      case "members":
        return voters.length !== 0 ? (
          <div className="p-4 md:p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Members</h2>
              <AddMembersDialog organizationId={orgId} />
            </div>
            <div className="space-y-3">
              <MemberBlock orgId={orgId} />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
            <AddMembersDialog organizationId={orgId} />
          </div>
        );
    }
  };

  if (departments.length === 0 && voters.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 pt-24">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-6 space-y-8">
            <div className="text-center space-y-4">
              <PlusCircle className="w-12 h-12 text-primary mx-auto" />
              <h2 className="text-xl font-semibold">
                Get Started with {currentOrg.name}
              </h2>
              <p className="text-muted-foreground">
                Create your first department and invite members
              </p>
            </div>
            <div className="space-y-3">
              <NewVotingDialog label="New vote" className="w-full" />
              <NewDepartmentDialog
                label="Create a new Department"
                organizationId={currentOrg.id}
                onSuccess={handleNewDepartment}
                departments={departments}
                className="w-full"
              />
              <AddMembersDialog organizationId={orgId} className="w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col pt-20">
      <header className="border-b bg-white px-4 md:px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-xl md:text-2xl font-semibold mb-4">{currentOrg.name}</h1>
          <div className="flex gap-2 overflow-x-auto pb-2 -mb-2">
            <Button
              variant={activeTab === "votes" ? "default" : "outline"}
              onClick={() => setActiveTab("votes")}
              className="whitespace-nowrap"
            >
              Votes ({votes.length})
            </Button>
            <Button
              variant={activeTab === "departments" ? "default" : "outline"}
              onClick={() => setActiveTab("departments")}
              className="whitespace-nowrap"
            >
              Departments ({departments.length})
            </Button>
            <Button
              variant={activeTab === "members" ? "default" : "outline"}
              onClick={() => setActiveTab("members")}
              className="whitespace-nowrap"
            >
              Members ({voters.length})
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">{renderContent()}</main>
    </div>
  );
};

export default OrganizationPage;