"use client";

interface OrganizationPageProps {
  orgId: string;
}

const OrganizationPage = ({ orgId }: OrganizationPageProps) => {
  return <div>{orgId}</div>;
};

export default OrganizationPage;
