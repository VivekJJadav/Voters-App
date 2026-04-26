"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Mail, Plus, Users } from "lucide-react";
import DatetimePicker from "./Date-Time-Picker";
import { useState } from "react";
import { Switch } from "./ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useSelectedOrganization } from "@/context/SelectedOrganizationContext";
import { toast } from "sonner";
import axios from "axios";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { readDashboardSettings } from "@/lib/dashboardSettings";

interface NewVotingDialogProps {
  label: string;
  onVoteCreated?: () => void;
  departmentId?: string;
  className?: string;
}

const RequiredIndicator = () => <span className="text-red-500 ml-1">*</span>;

const NewVotingDialog = ({
  label,
  onVoteCreated,
  departmentId,
  className,
}: NewVotingDialogProps) => {
  const router = useRouter();

  const { selectedOrgId } = useSelectedOrganization();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [isAnonymous, setIsAnonymous] = useState(
    () => readDashboardSettings().defaultAnonymous
  );
  const [votingType, setVotingType] = useState<string>(
    () => readDashboardSettings().defaultVoteType
  );
  const [open, setOpen] = useState(false);

  const handleSubmit = async () => {
    if (!selectedOrgId) {
      toast.error("Please select a voting space first");
      return;
    }

    if (!name || !description) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (startDate >= endDate) {
      toast.error("End date must be after start date");
      return;
    }

    try {
      setIsLoading(true);

      const response = await axios.post("/api/vote", {
        name,
        description,
        candidates: [],
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        isAnonymous,
        voteType: votingType,
        organizationId: selectedOrgId,
        ...(departmentId && { departmentId }),
      });

      if (response.status !== 201) {
        throw new Error(response.data.details || "Failed to create vote");
      }

      const invitationSummary = response.data?.candidateInvitationSummary;
      if (invitationSummary?.failed > 0 && invitationSummary?.sent > 0) {
        toast.warning(
          `Vote created. ${invitationSummary.sent} invitation${
            invitationSummary.sent === 1 ? "" : "s"
          } sent, ${invitationSummary.failed} failed.`
        );
      } else if (invitationSummary?.failed > 0) {
        toast.warning(
          "Vote created, but candidate invitation emails could not be sent."
        );
      } else if (invitationSummary?.sent > 0) {
        toast.success(
          `Vote created and ${invitationSummary.sent} candidate invitation${
            invitationSummary.sent === 1 ? "" : "s"
          } sent.`
        );
      } else {
        toast.success("Vote created successfully");
      }

      setOpen(false);
      resetForm();

      if (onVoteCreated) {
        onVoteCreated();
      }

      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create vote"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setStartDate(new Date());
    setEndDate(new Date());
    const dashboardSettings = readDashboardSettings();
    setIsAnonymous(dashboardSettings.defaultAnonymous);
    setVotingType(dashboardSettings.defaultVoteType);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className={cn(
            "mb-2 sm:mb-0 sm:w-auto",
            className
          )}
        >
          <Plus className="size-4 mr-2" />
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new vote</DialogTitle>
          <DialogDescription>
            Start a vote inside the selected voting space.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Vote Name
              <RequiredIndicator />
            </Label>
            <Input
              id="name"
              className="col-span-3"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
              <RequiredIndicator />
            </Label>
            <Input
              id="description"
              className="col-span-3"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">Candidates</Label>
            <div className="col-span-3 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-3 text-sm text-white/60">
              <div className="flex items-center gap-2 font-medium text-white">
                <Mail className="size-4" />
                <span>Email invitations</span>
              </div>
              <div className="mt-2 flex items-start gap-2">
                <Users className="size-4 shrink-0 mt-0.5" />
                <p>
                  Eligible members will be asked to accept candidacy and add a
                  slogan before appearing on the vote page.
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="voting-type" className="text-right">
              Voting Type
            </Label>
            <div className="col-span-3">
              <Select value={votingType} onValueChange={setVotingType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Voting Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="YES_NO">YES/NO</SelectItem>
                  <SelectItem value="SINGLE_CHOICE">Single Choice</SelectItem>
                  <SelectItem value="MULTIPLE_CHOICE">
                    Multiple Choice
                  </SelectItem>
                  <SelectItem value="RANKED_CHOICE">Ranked Choice</SelectItem>
                  <SelectItem value="PREFERENTIAL">Preferential</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="start-date" className="text-right">
              Start Date and Time
            </Label>
            <div className="w-[343px]">
              <DatetimePicker value={startDate} onChange={setStartDate} />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="end-date" className="text-right">
              End Date and Time
            </Label>
            <div className="w-[343px]">
              <DatetimePicker value={endDate} onChange={setEndDate} />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="anonymous-voting" className="text-right">
              Anonymous
            </Label>
            <Switch
              id="anonymous-voting"
              checked={isAnonymous}
              onCheckedChange={setIsAnonymous}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Vote"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewVotingDialog;
