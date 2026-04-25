"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Building2,
  CheckCircle2,
  LogOut,
  Mail,
  ShieldCheck,
  SlidersHorizontal,
  User,
  Vote,
} from "lucide-react";
import useAuthStore from "@/store/authStore";
import useGetUserMemberships from "@/app/actions/useGetUserMemberships";
import { useSelectedOrganization } from "@/context/SelectedOrganizationContext";
import {
  DashboardSettings,
  defaultDashboardSettings,
  readDashboardSettings,
  writeDashboardSettings,
} from "@/lib/dashboardSettings";
import SelectorForm from "@/components/SelectorForm";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const Settings = () => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { organizations, organizationsLoading } = useGetUserMemberships();
  const { selectedOrgId, setSelectedOrgId } = useSelectedOrganization();
  const [settings, setSettings] = useState<DashboardSettings>(
    defaultDashboardSettings
  );
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  useEffect(() => {
    setSettings(readDashboardSettings());
    setSettingsLoaded(true);
  }, []);

  const selectedOrganization = useMemo(
    () => organizations.find((org) => org.id === selectedOrgId),
    [organizations, selectedOrgId]
  );

  const updateSetting = <Key extends keyof DashboardSettings>(
    key: Key,
    value: DashboardSettings[Key]
  ) => {
    const nextSettings = {
      ...settings,
      [key]: value,
    };

    setSettings(nextSettings);
    writeDashboardSettings(nextSettings);
    toast.success("Settings updated");
  };

  const handleLogout = () => {
    logout();
    router.push("/sign-in");
  };

  if (organizationsLoading || !settingsLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-28">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-12">
      <div className="max-w-6xl mx-auto px-4 md:px-6 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
              Settings
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Account, organization, and voting preferences
            </p>
          </div>
          <Badge variant="outline" className="w-fit bg-white">
            <ShieldCheck className="mr-2 h-3.5 w-3.5 text-emerald-600" />
            Signed in
          </Badge>
        </div>

        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 md:w-fit">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="organization">Organization</TabsTrigger>
            <TabsTrigger value="voting">Voting</TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
              <Card className="rounded-lg shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-slate-700" />
                    </div>
                    <div>
                      <CardTitle>Profile</CardTitle>
                      <CardDescription>Basic account details</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="settings-name">Name</Label>
                    <Input
                      id="settings-name"
                      value={user?.name || ""}
                      readOnly
                      className="bg-white"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="settings-email">Email</Label>
                    <Input
                      id="settings-email"
                      value={user?.email || ""}
                      readOnly
                      className="bg-white"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-lg shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-red-50 flex items-center justify-center">
                      <LogOut className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <CardTitle>Session</CardTitle>
                      <CardDescription>Current device access</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg border bg-white p-4">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.email || "No active account"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Local dashboard session
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card className="rounded-lg shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Bell className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>Email and invite updates</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">Email notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Vote, result, and membership updates
                    </p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) =>
                      updateSetting("emailNotifications", checked)
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">Invitation updates</p>
                    <p className="text-sm text-muted-foreground">
                      Delivery and acceptance activity
                    </p>
                  </div>
                  <Switch
                    checked={settings.invitationUpdates}
                    onCheckedChange={(checked) =>
                      updateSetting("invitationUpdates", checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="organization" className="space-y-6">
            <Card className="rounded-lg shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-slate-700" />
                  </div>
                  <div>
                    <CardTitle>Organization</CardTitle>
                    <CardDescription>Current dashboard context</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {organizations.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-[260px_1fr] md:items-end">
                    <div className="space-y-2">
                      <Label>Selected organization</Label>
                      <SelectorForm
                        values={organizations}
                        placeholder="Select an organization"
                        loading={organizationsLoading}
                        value={selectedOrgId}
                        onChange={setSelectedOrgId}
                      />
                    </div>
                    <div className="rounded-lg border bg-white p-4">
                      <p className="text-sm text-muted-foreground">
                        Active organization
                      </p>
                      <p className="font-semibold text-gray-900 mt-1">
                        {selectedOrganization?.name || "No organization selected"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border bg-white p-6 text-center">
                    <Building2 className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                    <p className="font-medium">No organizations found</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Create or join an organization to unlock this section.
                    </p>
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-lg border bg-white p-4">
                    <Building2 className="h-5 w-5 text-slate-700 mb-3" />
                    <p className="text-2xl font-semibold">
                      {organizations.length}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Organizations
                    </p>
                  </div>
                  <div className="rounded-lg border bg-white p-4">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 mb-3" />
                    <p className="text-2xl font-semibold">
                      {selectedOrganization ? "Active" : "None"}
                    </p>
                    <p className="text-sm text-muted-foreground">Selection</p>
                  </div>
                  <div className="rounded-lg border bg-white p-4">
                    <Mail className="h-5 w-5 text-blue-600 mb-3" />
                    <p className="text-2xl font-semibold">
                      {settings.invitationUpdates ? "On" : "Off"}
                    </p>
                    <p className="text-sm text-muted-foreground">Invites</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="voting" className="space-y-6">
            <Card className="rounded-lg shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-violet-50 flex items-center justify-center">
                    <Vote className="h-5 w-5 text-violet-600" />
                  </div>
                  <div>
                    <CardTitle>Voting Defaults</CardTitle>
                    <CardDescription>Preferred vote setup values</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-2">
                  <Label>Default vote type</Label>
                  <Select
                    value={settings.defaultVoteType}
                    onValueChange={(value) =>
                      updateSetting("defaultVoteType", value)
                    }
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select vote type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="YES_NO">YES/NO</SelectItem>
                      <SelectItem value="SINGLE_CHOICE">
                        Single Choice
                      </SelectItem>
                      <SelectItem value="MULTIPLE_CHOICE">
                        Multiple Choice
                      </SelectItem>
                      <SelectItem value="RANKED_CHOICE">
                        Ranked Choice
                      </SelectItem>
                      <SelectItem value="PREFERENTIAL">Preferential</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">Anonymous by default</p>
                    <p className="text-sm text-muted-foreground">
                      New voting dialogs can start private
                    </p>
                  </div>
                  <Switch
                    checked={settings.defaultAnonymous}
                    onCheckedChange={(checked) =>
                      updateSetting("defaultAnonymous", checked)
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">Live results preference</p>
                    <p className="text-sm text-muted-foreground">
                      Keep a saved preference for result visibility
                    </p>
                  </div>
                  <Switch
                    checked={settings.showLiveResults}
                    onCheckedChange={(checked) =>
                      updateSetting("showLiveResults", checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-lg shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                    <SlidersHorizontal className="h-5 w-5 text-slate-700" />
                  </div>
                  <div>
                    <CardTitle>Saved Preferences</CardTitle>
                    <CardDescription>Stored on this browser</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-3">
                  <Badge variant="secondary" className="justify-center py-2">
                    {settings.defaultVoteType.replace("_", " ")}
                  </Badge>
                  <Badge variant="secondary" className="justify-center py-2">
                    Anonymous {settings.defaultAnonymous ? "On" : "Off"}
                  </Badge>
                  <Badge variant="secondary" className="justify-center py-2">
                    Results {settings.showLiveResults ? "Live" : "After vote"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
