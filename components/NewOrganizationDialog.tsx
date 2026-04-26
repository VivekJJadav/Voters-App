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
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Organization } from "@prisma/client";

interface NewVotingDialogProps {
  label: string;
  onSuccess?: (orgName: Organization) => void;
}

interface FormValues {
  name: string;
  creatorId: string;
}

const NewOrganizationDialog = ({ label, onSuccess }: NewVotingDialogProps) => {
  const user = useAuthStore((state) => state.user);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    defaultValues: {
      name: "",
      creatorId: "",
    },
  });

  useEffect(() => {
    if (user?.id) {
      form.setValue("creatorId", user.id);
    }
  }, [user, form]);

  const onSubmit = async (values: FormValues) => {
    if (!values.creatorId) {
      toast.error("Please log in to create a voting space");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post("/api/organization", {
        name: values.name,
        creatorId: values.creatorId,
      });

      const newOrganization = response.data;

      toast.success("Voting space created successfully!");
      setIsOpen(false);
      form.reset({
        name: "",
        creatorId: user?.id || "",
      });

      if (newOrganization) {
        onSuccess?.(newOrganization); 
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.error || "Failed to create voting space"
        );
      } else {
        toast.error("An unexpected error occurred");
      }
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <Plus className="size-4 mr-2" /> {label}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create voting space</DialogTitle>
          <DialogDescription>
            Set this up only if you will organize votes for a group.
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
                      Space Name
                    </Label>
                    <FormControl>
                      <Input
                        {...field}
                        id="name"
                        type="text"
                        placeholder="Enter space name"
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
              name="creatorId"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input {...field} id="creatorId" type="hidden" />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create space"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NewOrganizationDialog;
