import React, { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Upload, AlertCircle, Loader2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import useGetDepartments from "@/app/actions/useGetDepartments";
import axios from "axios";
import { toast } from "sonner";

interface Member {
  email: string;
  name: string;
  department: string;
  isValid: boolean;
  error?: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_ENTRIES = 500;

function parseCSV(csvText: string): Array<{ [key: string]: string }> {
  const lines = csvText.split(/\r\n|\n/);
  const headers = lines[0].split(",").map((header) => header.trim());
  const result = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;

    const currentLine = lines[i].split(",").map((field) => field.trim());
    const obj: { [key: string]: string } = {};

    for (let j = 0; j < headers.length; j++) {
      obj[headers[j].toLowerCase()] = currentLine[j] || "";
    }

    if (obj.email && obj.name) {
      result.push(obj);
    }
  }

  return result;
}

export default function AddMembersDialog({
  organizationId,
}: {
  organizationId: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { departments, loading: loadingDepartments } =
    useGetDepartments(organizationId);
  const [manualEntry, setManualEntry] = useState<
    Omit<Member, "isValid" | "error">
  >({
    email: "",
    name: "",
    department: "",
  });

  const isEmailDuplicate = (email: string): boolean => {
    return members.some(
      (member) => member.email.toLowerCase() === email.toLowerCase()
    );
  };

  const validateMember = async (
    member: Omit<Member, "isValid" | "error">
  ): Promise<Member> => {
    try {
      if (!member.email || !member.name) {
        throw new Error("Email and name are required");
      }

      if (!member.email.includes("@")) {
        throw new Error("Invalid email format");
      }

      if (isEmailDuplicate(member.email)) {
        return {
          ...member,
          isValid: false,
          error: "Email already exists in the current list",
        };
      }

      // const response = await axios.post("/api/voters/validate-email", {
      //   email: member.email,
      // });

      // if (response.data?.message === "Email already exists") {
      //   return {
      //     ...member,
      //     isValid: false,
      //     error: "Email already exists in the system",
      //   };
      // }

      // if (!response.data?.isValid) {
      //   return {
      //     ...member,
      //     isValid: false,
      //     error: response.data?.message || "Failed to validate email",
      //   };
      // }

      return { ...member, isValid: true };
    } catch (err) {
      let errorMessage = "Invalid member data";

      if (axios.isAxiosError(err)) {
        errorMessage =
          err.response?.data?.message || "Failed to validate email";
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      return {
        ...member,
        isValid: false,
        error: errorMessage,
      };
    }
  };

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      setError("Please upload a CSV file");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("File size exceeds 5MB limit");
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      const text = await file.text();
      const parsedData = parseCSV(text);

      if (parsedData.length > MAX_ENTRIES) {
        setError(`Maximum ${MAX_ENTRIES} entries allowed`);
        return;
      }

      if (parsedData.length === 0) {
        setError("No valid entries found in CSV");
        return;
      }

      const uniqueData = parsedData.filter(
        (row) => !isEmailDuplicate(row.email)
      );

      if (uniqueData.length < parsedData.length) {
        setError(
          `${
            parsedData.length - uniqueData.length
          } duplicate email(s) were skipped`
        );
      }

      const parsedMembers = await Promise.all(
        uniqueData.map((row) =>
          validateMember({
            email: row.email,
            name: row.name,
            department: row.department || "",
          })
        )
      );

      setMembers((prevMembers) => [...prevMembers, ...parsedMembers]);
    } catch (err) {
      setError(
        "Failed to process file. Please ensure the CSV contains 'email' and 'name' columns."
      );
    } finally {
      setIsProcessing(false);
      event.target.value = "";
    }
  };

  const handleManualSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (isEmailDuplicate(manualEntry.email)) {
      setError("This email already exists in the current list");
      return;
    }

    const validatedMember = await validateMember(manualEntry);

    if (!validatedMember.isValid) {
      setError(validatedMember.error || "Invalid member data");
      return;
    }

    setMembers((prevMembers) => [...prevMembers, validatedMember]);
    setManualEntry({ email: "", name: "", department: "" });
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError("");

      const validMembers = members.filter((m) => m.isValid);

      if (validMembers.length === 0) {
        setError("No valid members to add");
        return;
      }

      const response = await axios.post("/api/voters/send-invitation", {
        emails: validMembers.map((member) => member.email),
        names: validMembers.map((member) => member.name),
        organizationId,
      });

      if (response.data.partialSuccess) {
        setError(
          `${response.data.failedCount} invitation${
            response.data.failedCount! > 1 ? "s" : ""
          } failed to send. Successfully sent ${
            validMembers.length - response.data.failedCount!
          } invitation${
            validMembers.length - response.data.failedCount! > 1 ? "s" : ""
          }.`
        );

        const successfulEmails = response.data.results
          .filter((r: any) => r.success)
          .map((r: any) => r.email);

        setMembers((prev) =>
          prev.filter((m) => !successfulEmails.includes(m.email))
        );
      } else {
        setOpen(false);
        setMembers([]);
        router.refresh();
      }
    } catch (err) {
      console.error("Error:", err);
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Failed to send invitations. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeMember = (email: string) => {
    setMembers(members.filter((m) => m.email !== email));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Members</Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Members</DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            <TabsTrigger value="csv">CSV Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-4 mt-4">
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email*</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="member@example.com"
                  value={manualEntry.email}
                  onChange={(e) =>
                    setManualEntry((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="name">Full Name*</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={manualEntry.name}
                  onChange={(e) =>
                    setManualEntry((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="department">Department</Label>
                <Select
                  value={manualEntry.department}
                  onValueChange={(value) =>
                    setManualEntry((prev) => ({ ...prev, department: value }))
                  }
                  disabled={loadingDepartments}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full">
                Add Member
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="csv" className="space-y-6 mt-4">
            <div className="border-2 border-dashed border-gray-300 p-6 rounded-lg hover:border-primary transition-colors">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                id="csv-upload"
              />
              <label
                htmlFor="csv-upload"
                className="flex flex-col items-center cursor-pointer"
              >
                <Upload className="h-8 w-8 text-gray-500" />
                <span className="mt-2 text-sm text-gray-500">
                  Drop your CSV file here or click to browse
                </span>
                <span className="mt-1 text-xs text-gray-400">
                  Required columns: email, name
                </span>
              </label>
            </div>

            {isProcessing && (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processing file...</span>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {members.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">
              Added Members ({members.length})
            </h4>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {members.map((member) => (
                <div
                  key={member.email}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        member.isValid ? "bg-green-500" : "bg-red-500"
                      }`}
                    />
                    <span className="text-sm">
                      {member.name} ({member.email})
                      {member.department &&
                        departments.find((d) => d.id === member.department)
                          ?.name &&
                        ` - ${
                          departments.find((d) => d.id === member.department)
                            ?.name
                        }`}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMember(member.email)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setOpen(false);
              setMembers([]);
              setError("");
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!members.some((m) => m.isValid) || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding Members...
              </>
            ) : (
              "Confirm and Add Members"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
