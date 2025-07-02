import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import useAuthStore from "@/store/authStore";
import { Department } from "@prisma/client";
import { toast } from "sonner";

type Listener = () => void;
type DepartmentWithFullPath = Department & { fullPath: string };

const departmentStore = {
  listeners: new Set<Listener>(),
  departments: [] as Department[],

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  },

  notify() {
    this.listeners.forEach((listener) => listener());
  },

  setDepartments(deps: Department[]) {
    this.departments = deps;
    this.notify();
  },

  addDepartment(dep: Department) {
    this.departments = [...this.departments, dep];
    this.notify();
  },

  deleteDepartment(id: string) {
    this.departments = this.departments.filter((dep) => dep.id !== id);
    this.notify();
  },

  updateDepartment(updatedDep: Department) {
    this.departments = this.departments.map((dep) =>
      dep.id === updatedDep.id ? updatedDep : dep
    );
    this.notify();
  },
};

const useGetDepartments = (organizationId: string) => {
  const user = useAuthStore((state) => state.user);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getDepartmentPath = (
    deptId: string,
    deps = new Set<string>()
  ): string => {
    if (deps.has(deptId)) return ""; 
    deps.add(deptId);

    const dept = departments.find((d) => d.id === deptId);
    if (!dept) return "";

    if (!dept.parentId) return dept.name;

    const parentPath = getDepartmentPath(dept.parentId, deps);
    return parentPath ? `${parentPath} - ${dept.name}` : dept.name;
  };

  const departmentsWithPaths = useMemo(() => {
    return departments.map((dept) => ({
      ...dept,
      fullPath: getDepartmentPath(dept.id),
    }));
  }, [departments]);

  const sortedDepartments = useMemo(() => {
    return [...departmentsWithPaths].sort((a, b) =>
      a.fullPath.localeCompare(b.fullPath)
    );
  }, [departmentsWithPaths]);

  useEffect(() => {
    const fetchDepartments = async () => {
      setLoading(true);
      setError(null);

      if (!user?.id || !organizationId) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get("/api/department", {
          headers: { organizationId },
        });
        const deps = response.data || [];
        departmentStore.setDepartments(deps);
        setDepartments(deps);
      } catch (error) {
        console.error("Error fetching departments:", error);
        setError("Failed to fetch departments. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();

    const unsubscribe = departmentStore.subscribe(() => {
      setDepartments([...departmentStore.departments]);
    });

    return unsubscribe;
  }, [user?.id, organizationId]);

  const handleNewDepartment = async (newDep: Department) => {
    try {
      const response = await axios.post("/api/department", {
        name: newDep.name,
        parentId: newDep.parentId,
        organizationId: organizationId,
      });
      const createdDep = response.data;
      departmentStore.addDepartment(createdDep);

      toast.success("Department created successfully");
      return createdDep;
    } catch (error) {
      console.error("Error creating department:", error);
      toast.error("Failed to create department. Please try again later.");
      throw error;
    }
  };

  const getAllChildDepartmentIds = (
    departments: Department[],
    parentId: string,
    collectedIds: string[] = []
  ): string[] => {
    const childDepartments = departments.filter(
      (dept) => dept.parentId === parentId
    );

    childDepartments.forEach((child) => {
      getAllChildDepartmentIds(departments, child.id, collectedIds);
      collectedIds.push(child.id);
    });

    return collectedIds;
  };

  const handleDeleteDepartment = async (id: string) => {
    if (!organizationId) {
      toast.error("Organization ID is missing");
      return;
    }

    try {
      const childIds = getAllChildDepartmentIds(
        departmentStore.departments,
        id
      );

      await axios.delete("/api/department", {
        headers: {
          organizationId: organizationId,
          "Content-Type": "application/json",
        },
        data: {
          id,
          childIds,
        },
      });

      childIds.forEach((childId) => {
        departmentStore.deleteDepartment(childId);
      });
      departmentStore.deleteDepartment(id);

      toast.success("Department deleted successfully");
    } catch (error) {
      console.error("Error deleting department:", error);

      try {
        const response = await axios.get("/api/department", {
          headers: { organizationId },
        });
        departmentStore.setDepartments(response.data || []);
      } catch (refreshError) {
        console.error("Error refreshing departments:", refreshError);
      }

      toast.error("Failed to delete department");
      throw error;
    }
  };

  const handleUpdateDepartment = async (updatedDep: Department) => {
    try {
      departmentStore.updateDepartment(updatedDep);

      const response = await axios.put(
        `/api/department/${updatedDep.id}`,
        updatedDep
      );
      const updatedData = response.data;

      departmentStore.updateDepartment(updatedData);
      return updatedData;
    } catch (error) {
      console.error("Error updating department:", error);
      const response = await axios.get("/api/department", {
        headers: { organizationId },
      });
      departmentStore.setDepartments(response.data || []);
      throw error;
    }
  };

  return {
    departments: sortedDepartments,
    loading,
    error,
    handleNewDepartment,
    handleDeleteDepartment,
    handleUpdateDepartment,
  };
};

export default useGetDepartments;
