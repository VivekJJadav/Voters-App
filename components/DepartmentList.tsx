import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import NewDepartmentDialog from "./NewDepartmentDialog";
import { Department } from "@prisma/client";
import useGetDepartments from "@/app/actions/useGetDepartments";
import NewVotingDialog from "./NewVotingDialog";
import { MdOutlineDelete } from "react-icons/md";

interface DepartmentListProps {
  departments: Department[];
  handleDeleteDepartment: (id: string) => void;
  parentId?: string | null;
  level?: number;
  organizationId: string;
}

const DepartmentList = ({
  departments,
  handleDeleteDepartment,
  parentId = null,
  level = 0,
  organizationId,
}: DepartmentListProps) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const dialogTriggerRef = useRef<HTMLButtonElement>(null);
  const { handleNewDepartment } = useGetDepartments(organizationId);

  const handleExpand = (departmentId: string) => {
    setExpanded((prev) => ({
      ...prev,
      [departmentId]: !prev[departmentId],
    }));
  };

  const handleDepartment = (departmentId: string) => {
    setSelectedParentId(departmentId);
    if (dialogTriggerRef.current) {
      dialogTriggerRef.current.click();
    }
  };

  const handleNewDepartmentWithHierarchy = async (
    newDepartment: Department
  ) => {
    const departmentWithHierarchy = {
      ...newDepartment,
      parentId: selectedParentId,
      organizationId: organizationId,
    };

    await handleNewDepartment(departmentWithHierarchy);
    if (selectedParentId) {
      setExpanded((prev) => ({
        ...prev,
        [selectedParentId]: true,
      }));
    }
    setSelectedParentId(null);
  };

  const currentLevelDepartments = departments.filter(
    (dep) => dep.parentId === parentId
  );

  const hasChildDepartments = (departmentId: string) => {
    return departments.some((dep) => dep.parentId === departmentId);
  };

  if (currentLevelDepartments.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <NewDepartmentDialog
        label="New Department"
        organizationId={organizationId}
        departments={departments}
        onSuccess={handleNewDepartmentWithHierarchy}
        triggerRef={dialogTriggerRef}
        parentId={selectedParentId}
      />
      {currentLevelDepartments.map((department) => (
        <div key={department.id}>
          <div
            style={{ marginLeft: `${level * 1}rem` }}
            className="p-2 sm:p-4 border-[1px] border-gray-400 rounded-lg bg-white shadow-sm"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {hasChildDepartments(department.id) ? (
                  <button
                    onClick={() => handleExpand(department.id)}
                    className="w-6 h-6 flex items-center justify-center text-xs hover:bg-gray-100 rounded"
                  >
                    {expanded[department.id] ? "▼" : "▶"}
                  </button>
                ) : (
                  <div className="w-6 h-6" />
                )}
                <h3 className="font-medium text-gray-800 text-sm sm:text-base">
                  {department.name}
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <NewVotingDialog
                  label="Create Vote"
                  departmentId={department.id}
                />
                <Button
                  className="bg-blue-500 text-xs sm:text-sm px-2 py-1 sm:px-4 sm:py-2"
                  onClick={() => handleDepartment(department.id)}
                >
                  <PlusIcon size={16} />
                </Button>
                <Button
                  className="bg-red-500 text-xs sm:text-sm px-2 py-1 sm:px-4 sm:py-2"
                  onClick={() => handleDeleteDepartment(department.id)}
                >
                  <MdOutlineDelete />
                </Button>
              </div>
            </div>
          </div>
          {hasChildDepartments(department.id) && (
            <div
              className={`overflow-hidden transition-all duration-300 ${
                expanded[department.id]
                  ? "max-h-[1000px] opacity-100"
                  : "max-h-0 opacity-0"
              }`}
            >
              {expanded[department.id] && (
                <DepartmentList
                  departments={departments}
                  handleDeleteDepartment={handleDeleteDepartment}
                  parentId={department.id}
                  level={level + 1}
                  organizationId={organizationId}
                />
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default DepartmentList;
