import { useSelectedOrganization } from "@/context/SelectedOrganizationContext";
import { cn } from "@/lib/utils";
import { Organization } from "@prisma/client";

interface OrganizationTagProps {
  org: Organization;
}

const OrganizationTag = ({ org }: OrganizationTagProps) => {
  const { selectedOrgId, setSelectedOrgId } = useSelectedOrganization();

  const handleClick = (orgId: string) => {
    setSelectedOrgId(orgId);
  };

  return (
    <li
      key={org.id}
      className={cn(
        "p-4 border-gray-400 border-[1px] rounded-lg hover:shadow-md transition-shadow duration-200 cursor-pointer",
        selectedOrgId === org.id
          ? "bg-gray-600 text-white shadow-md"
          : "bg-white"
      )}
      onClick={() => handleClick(org.id)}
    >
      <h3 className="font-medium">{org.name}</h3>
    </li>
  );
};

export default OrganizationTag;
