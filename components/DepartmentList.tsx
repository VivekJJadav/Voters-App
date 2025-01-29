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
            className="relative p-4 border border-gray-200 rounded-lg bg-white shadow-sm transition-all duration-200 hover:shadow-md hover:border-gray-300"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {hasChildDepartments(department.id) ? (
                  <button
                    onClick={() => handleExpand(department.id)}
                    className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-200"
                  >
                    {expanded[department.id] ? (
                      <ChevronDown className="w-4 h-4 text-gray-600" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-600" />
                    )}
                  </button>
                ) : (
                  <div className="w-6 h-6" />
                )}
                <h3 className="font-semibold text-gray-800">
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
                  className="bg-white hover:bg-gray-50 border-gray-200 text-gray-700 hover:text-gray-900 transition-colors duration-200"
                  onClick={() => handleDepartment(department.id)}
                >
                  <PlusIcon className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white hover:bg-red-50 border-gray-200 text-red-600 hover:text-red-700 hover:border-red-200 transition-colors duration-200"
                  onClick={() => handleDeleteDepartment(department.id)}
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
