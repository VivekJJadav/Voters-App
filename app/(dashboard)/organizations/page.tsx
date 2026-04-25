"use client";

import NewOrganizationDialog from "@/components/NewOrganizationDialog";
import useGetOrganizations from "@/app/actions/useGetOrganizations";
import OrganizationPage from "../components/OrganizationPage";
import SelectorForm from "@/components/SelectorForm";
import OrganizationTag from "../components/OrganizationTag";
import { useSelectedOrganization } from "@/context/SelectedOrganizationContext";
import LoadingSpinner from "@/components/LoadingSpinner";

const Organization = () => {
  const { organizations, loading, error, handleNewOrganization } =
    useGetOrganizations();

  const { selectedOrgId } = useSelectedOrganization();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // For empty state with no organizations
  if (organizations.length === 0) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <NewOrganizationDialog
          label="Create a new organization"
          onSuccess={(Org) => handleNewOrganization(Org)}
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden px-4 pb-5 pt-24 md:px-6">
      <div className="z-10 shrink-0">
        <div className="flex flex-col gap-3 pb-4 md:flex-row md:items-center md:justify-between">
          <NewOrganizationDialog
            label="Organization"
            onSuccess={(Org) => handleNewOrganization(Org)}
          />
          <div className="z-50 w-full md:hidden">
            <SelectorForm
              values={organizations}
              placeholder="Select an organization"
              loading={loading}
            />
          </div>
        </div>
      </div>
      <div className="flex min-h-0 w-full flex-1 gap-5">
        <aside className="hidden w-[280px] shrink-0 overflow-y-auto pb-1 pr-1 md:block lg:w-[320px]">
          {loading ? (
            <p className="text-sm text-white/60">Loading...</p>
          ) : (
            <ul className="space-y-3">
              {organizations.map((org) => (
                <OrganizationTag org={org} key={org.id} />
              ))}
            </ul>
          )}
        </aside>
        <section className="min-h-0 w-full flex-1 overflow-hidden rounded-lg border border-white/12 bg-white/[0.07] shadow-[0_18px_50px_rgba(15,12,41,0.24)] backdrop-blur-2xl">
          {selectedOrgId ? (
            <OrganizationPage orgId={selectedOrgId} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Please select an organization
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Organization;
