import { useState } from "react";
import useGetDepartments from "@/app/actions/useGetDepartments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, Trash2, Users } from "lucide-react";
import NewDepartmentDialog from "@/components/NewDepartmentDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import LoadingSpinner from "@/components/LoadingSpinner";
import DepartmentTag from "./Department";
import useGetOrganizations from "@/app/actions/useGetOrganizations";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface DepartmentBlockProps {
  orgId: string;
}

const DepartmentBlock = ({ orgId }: DepartmentBlockProps) => {
  const [isDepartmentsExpanded, setIsDepartmentsExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const { organizations, handleDeleteOrganization } = useGetOrganizations();
  const currentOrg = organizations.find((org) => org.id === orgId);

  const {
    departments,
    handleNewDepartment,
    handleDeleteDepartment,
    loading: departmentsLoading,
  } = useGetDepartments(orgId);

  if (!currentOrg) {
    return (
      <Card className="lg:col-span-2">
        <CardContent className="flex items-center justify-center p-6">
          <p className="text-muted-foreground">Organization not found</p>
        </CardContent>
      </Card>
    );
  }

  const onDelete = async (organizationId: string) => {
    if (!organizationId) {
      toast.error("Organization ID is required");
      return;
    }

    setIsLoading(true);
    try {
      await handleDeleteOrganization(organizationId);
      toast.success("Organization deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete organization");
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="lg:col-span-2 space-y-6">
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsDepartmentsExpanded(!isDepartmentsExpanded)}
              className="flex items-center gap-2 group"
            >
              <div className="space-y-1 text-left">
                <CardTitle className="text-2xl">Departments</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {departments.length} active{" "}
                  {departments.length === 1 ? "department" : "departments"}
                </p>
              </div>
              <ChevronDown
                className={cn(
                  "h-5 w-5 text-muted-foreground transition-transform duration-300",
                  isDepartmentsExpanded ? "rotate-180" : ""
                )}
              />
            </button>
            <div className="flex items-center gap-2">
              <NewDepartmentDialog
                label="Create a new Department"
                organizationId={currentOrg.id}
                onSuccess={handleNewDepartment}
                departments={departments}
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => onDelete(currentOrg.id)}
                    disabled={isLoading}
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">
                    Delete organization and all departments
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </CardHeader>

        {isDepartmentsExpanded && (
          <>
            <Separator className="mb-4" />
            <CardContent>
              {departmentsLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="sm" />
                </div>
              ) : departments.length === 0 ? (
                <div className="flex flex-col items-center gap-4 text-center p-8 rounded-xl bg-muted/20">
                  <Users className="h-12 w-12 text-muted-foreground/40" />
                  <div className="space-y-2">
                    <p className="text-muted-foreground font-medium">
                      No departments yet
                    </p>
                    <p className="text-sm text-muted-foreground/80">
                      Create departments to organize your members
                    </p>
                  </div>
                  <NewDepartmentDialog
                    label="Create your first department"
                    organizationId={currentOrg.id}
                    onSuccess={handleNewDepartment}
                    departments={departments}
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <DepartmentTag
                    departments={departments}
                    handleDeleteDepartment={handleDeleteDepartment}
                    organizationId={currentOrg.id}
                  />
                </div>
              )}
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
};

export default DepartmentBlock;
