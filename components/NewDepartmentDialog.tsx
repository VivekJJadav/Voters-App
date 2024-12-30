"use client";

import useAuthStore from "@/store/authStore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { useForm } from "react-hook-form";
import axios from "axios";
import { RefObject, useState, useEffect } from "react";
import { toast } from "sonner";
import { Department } from "@prisma/client";
import SelectDepartmentForm from "./SelectDepartmentForm";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

interface NewDepartmentDialogProps {
  label: string;
  organizationId: string;
  onSuccess?: (department: Department) => void;
  departments: Department[];
  triggerRef?: RefObject<HTMLButtonElement>;
  parentId?: string | null;
}

interface FormValues {
  name: string;
  parentId: string | null;
  organizationId: string;
}

const NewDepartmentDialog = ({
  label,
  organizationId,
  onSuccess,
  departments,
  triggerRef,
  parentId,
}: NewDepartmentDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    defaultValues: {
      name: "",
      organizationId,
      parentId: null,
    },
  });

  useEffect(() => {
    if (parentId !== undefined) {
      form.setValue("parentId", parentId);
    }
  }, [parentId, form]);

  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast.error("Please log in to create a department.");
      return;
    }

    if (!values.name.trim()) {
      toast.error("Department name is required.");
      return;
    }

    setIsLoading(true);
    try {
      if (onSuccess) {
        onSuccess({
          name: values.name,
          parentId: values.parentId === "null" ? null : values.parentId,
          organizationId: values.organizationId,
        } as Department);
      }

      setIsOpen(false);
      form.reset({
        name: "",
        parentId: null,
        organizationId,
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.error || "Failed to create department."
        );
      } else {
        toast.error("An unexpected error occurred.");
      }
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      form.reset({
        name: "",
        organizationId,
        parentId: parentId || null,
      });
    }
  }, [isOpen, organizationId, parentId, form]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          ref={triggerRef}
          className={cn(
            "text-sm px-2 py-1 sm:px-4 sm:py-2 sm:text-base",
            label === "Create a new department"
              ? "inline-flex items-center justify-center"
              : "hidden"
          )}
        >
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create new Department</DialogTitle>
          <DialogDescription>
            Add a department to your organization and define its hierarchy.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 grid gap-4 py-4"
          >
            <FormField
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-4">
                    <Label htmlFor="name" className="text-sm font-medium w-1/3">
                      Department Name
                    </Label>
                    <FormControl>
                      <Input
                        {...field}
                        id="name"
                        type="text"
                        placeholder="Enter department name"
                        required
                        className="w-full"
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="parentId"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="parentId" className="text-sm font-medium">
                    Parent Department (optional)
                  </Label>
                  <FormControl>
                    <SelectDepartmentForm
                      placeholder="Select the parent department"
                      values={departments}
                      value={field.value ?? "null"}
                      onChange={(value) => field.onChange(value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <input type="hidden" {...form.register("organizationId")} />

            <DialogFooter className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NewDepartmentDialog;
