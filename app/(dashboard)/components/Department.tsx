import { Department } from "@prisma/client";
import DepartmentList from "@/components/DepartmentList";

interface DepartmentProps {
  departments: Department[];
  handleDeleteDepartment: (id: string) => void;
  organizationId: string;
}

const DepartmentTag = ({
  departments,
  handleDeleteDepartment,
  organizationId,
}: DepartmentProps) => {
  return (
    <DepartmentList
      departments={departments}
      handleDeleteDepartment={handleDeleteDepartment}
      organizationId={organizationId}
      parentId={null}
      level={0}
    />
  );
};

export default DepartmentTag;
