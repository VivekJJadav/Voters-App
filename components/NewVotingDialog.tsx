"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import CandidateSelection from "./CandidateSelection";
import { Plus } from "lucide-react";
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
import { User } from "@prisma/client";
import axios from "axios";

interface NewVotingDialogProps {
  label: string;
}

const RequiredIndicator = () => <span className="text-red-500 ml-1">*</span>;

const NewVotingDialog = ({ label }: NewVotingDialogProps) => {
  const { selectedOrgId } = useSelectedOrganization();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [votingType, setVotingType] = useState<string>("SINGLE_CHOICE");
  const [selectedCandidates, setSelectedCandidates] = useState<User[]>([]);
  const [open, setOpen] = useState(false);

const handleSubmit = async () => {
  if (!selectedOrgId) {
    toast.error("Please select an organization first");
    return;
  }

  if (!name || !description || selectedCandidates.length === 0) {
    toast.error("Please fill in all required fields");
    return;
  }

  if (startDate >= endDate) {
    toast.error("End date must be after start date");
    return;
  }

  try {
    setIsLoading(true);

    const candidateData = selectedCandidates.map((candidate) => ({
      userId: candidate.id,
      name: candidate.name,
    }));

    const response = await axios.post("/api/vote", {
      name,
      description,
      candidates: candidateData,
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
      isAnonymous,
      voteType: votingType,
      organizationId: selectedOrgId,
    });

    if (response.status !== 201) {
      throw new Error(response.data.details || "Failed to create vote");
    }

    toast.success("Vote created successfully");
    setOpen(false);
    resetForm();
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
    setIsAnonymous(false);
    setVotingType("SINGLE_CHOICE");
    setSelectedCandidates([]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto bg-black text-white mb-2 sm:mb-0">
          <Plus className="size-4 mr-2" />
          {label}
        </Button>
      </DialogTrigger>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start a new voting</DialogTitle>
            <DialogDescription>
              Start a new voting for your organization.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Voting Name
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="candidates" className="text-right">
                Candidates
                <RequiredIndicator />
              </Label>
              <div className="w-[343px]">
                <CandidateSelection
                  value={selectedCandidates}
                  onChange={setSelectedCandidates}
                />
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
      </DialogPortal>
    </Dialog>
  );
};

export default NewVotingDialog;
