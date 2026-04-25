"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon, ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import NewDepartmentDialog from "./NewDepartmentDialog";
import { Department } from "@prisma/client";
import useGetDepartments from "@/app/actions/useGetDepartments";
import NewVotingDialog from "./NewVotingDialog";

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
    <div className="space-y-3">
      <NewDepartmentDialog
        label="New Department"
        organizationId={organizationId}
        departments={departments}
        onSuccess={handleNewDepartmentWithHierarchy}
        triggerRef={dialogTriggerRef}
        parentId={selectedParentId}
      />
      {currentLevelDepartments.map((department) => (
        <div key={department.id} className="group">
          <div
            style={{ marginLeft: `${level * 1.5}rem` }}
            className="relative rounded-lg border border-white/12 bg-white/[0.08] p-4 shadow-[0_10px_30px_rgba(15,12,41,0.18)] transition-all duration-200 hover:border-white/22 hover:bg-white/[0.11]"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {hasChildDepartments(department.id) ? (
                  <button
                    onClick={() => handleExpand(department.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-white/65 transition-colors duration-200 hover:bg-white/10 hover:text-white"
                    aria-label={
                      expanded[department.id]
                        ? "Collapse department"
                        : "Expand department"
                    }
                  >
                    {expanded[department.id] ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                ) : (
                  <div className="h-7 w-7" />
                )}
                <h3 className="font-semibold text-white/92">
                  {department.name}
                </h3>
              </div>
              <div className="flex items-center gap-2 opacity-90 group-hover:opacity-100 transition-opacity duration-200">
                <NewVotingDialog
                  label="Create Vote"
                  departmentId={department.id}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/[0.14] bg-white/[0.07] text-white/70 shadow-none transition-colors duration-200 hover:border-white/25 hover:bg-white/12 hover:text-white"
                  onClick={() => handleDepartment(department.id)}
                  aria-label={`Create child department under ${department.name}`}
                >
                  <PlusIcon className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-300/20 bg-red-500/[0.08] text-red-200 shadow-none transition-colors duration-200 hover:border-red-300/30 hover:bg-red-500/[0.14] hover:text-red-100"
                  onClick={() => handleDeleteDepartment(department.id)}
                  aria-label={`Delete ${department.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          {hasChildDepartments(department.id) && (
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                expanded[department.id]
                  ? "max-h-[2000px] opacity-100"
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
