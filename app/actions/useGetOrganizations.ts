import { useEffect, useState } from "react";
import axios from "axios";
import useAuthStore from "@/store/authStore";

interface Organization {
  id: string;
  name: string;
  creatorId: string;
}

type Listener = () => void;

const organizationStore = {
  listeners: new Set<Listener>(),
  organizations: [] as Organization[],

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
      return;
    };
  },

  notify() {
    this.listeners.forEach((listener) => listener());
  },

  setOrganizations(orgs: Organization[]) {
    this.organizations = orgs;
    this.notify();
  },

  addOrganization(org: Organization) {
    this.organizations = [...this.organizations, org];
    this.notify();
  },
};

const useGetOrganizations = () => {
  const user = useAuthStore((state) => state.user);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrganizations = async () => {
      setLoading(true);
      setError(null);

      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`/api/organization/${user.id}`);
        const orgs = response.data || [];
        organizationStore.setOrganizations(orgs);
        setOrganizations(orgs);
      } catch (error) {
        console.error("Error fetching organizations:", error);
        setError("Failed to fetch organizations. Please try again later.");
        setOrganizations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();

    const unsubscribe = organizationStore.subscribe(() => {
      setOrganizations(organizationStore.organizations);
    });

    return unsubscribe;
  }, [user?.id]);

  const handleNewOrganization = (newOrg: Organization) => {
    organizationStore.addOrganization(newOrg);
  };

  return { organizations, loading, error, handleNewOrganization };
};

export default useGetOrganizations;
