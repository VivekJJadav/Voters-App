export type DashboardSettings = {
  emailNotifications: boolean;
  invitationUpdates: boolean;
  defaultAnonymous: boolean;
  defaultVoteType: string;
  showLiveResults: boolean;
};

export const DASHBOARD_SETTINGS_STORAGE_KEY = "voters-dashboard-settings";

export const defaultDashboardSettings: DashboardSettings = {
  emailNotifications: true,
  invitationUpdates: true,
  defaultAnonymous: true,
  defaultVoteType: "SINGLE_CHOICE",
  showLiveResults: false,
};

export const readDashboardSettings = (): DashboardSettings => {
  if (typeof window === "undefined") return defaultDashboardSettings;

  const storedSettings = window.localStorage.getItem(
    DASHBOARD_SETTINGS_STORAGE_KEY
  );
  if (!storedSettings) return defaultDashboardSettings;

  try {
    return {
      ...defaultDashboardSettings,
      ...JSON.parse(storedSettings),
    };
  } catch {
    return defaultDashboardSettings;
  }
};

export const writeDashboardSettings = (settings: DashboardSettings) => {
  window.localStorage.setItem(
    DASHBOARD_SETTINGS_STORAGE_KEY,
    JSON.stringify(settings)
  );
};
