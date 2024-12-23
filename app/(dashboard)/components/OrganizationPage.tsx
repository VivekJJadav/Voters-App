"use client";

import { Button } from "@/components/ui/button";

interface OrganizationPageProps {
  orgId: string;
}

const OrganizationPage = ({ orgId }: OrganizationPageProps) => {
  return (
      <div>
        <Button>Make a department</Button>
        {orgId}
      </div>
    )
};

export default OrganizationPage;
