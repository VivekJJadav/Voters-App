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
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Department } from "@prisma/client";

interface NewDepartmentDialogProps {
  label: string;
  organizationId: string;
  onSuccess?: (department: Department) => void;
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
}: NewDepartmentDialogProps) => {
  const user = useAuthStore((state) => state.user);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    defaultValues: {
      name: "",
      parentId: null,
      organizationId,
    },
  });

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
        await onSuccess({
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="text-sm px-2 py-1 sm:px-4 sm:py-2 sm:text-base">
          Make a department
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
                    <Select
                      onValueChange={(value) =>
                        field.onChange(value === "null" ? null : value)
                      }
                      value={field.value || "null"}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a parent department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="null">None</SelectItem>
                      </SelectContent>
                    </Select>
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
