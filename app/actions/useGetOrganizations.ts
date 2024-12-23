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

  deleteOrganization(id: string) {
    this.organizations = this.organizations.filter((org) => org.id !== id);
    this.notify();
  },

  updateOrganization(updatedOrg: Organization) {
    this.organizations = this.organizations.map((org) =>
      org.id === updatedOrg.id ? updatedOrg : org
    );
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

  const handleDeleteOrganization = async (id: string) => {
    try {
      organizationStore.deleteOrganization(id);
      

      await axios.delete(`/api/organization/${id}`);
    } catch (error) {
      console.error("Error deleting organization:", error);
      const response = await axios.get(`/api/organization/${user?.id}`);
      organizationStore.setOrganizations(response.data || []);
      throw error; 
    }
  };

  const handleUpdateOrganization = async (updatedOrg: Organization) => {
    try {
      const response = await axios.put(
        `/api/organization/${updatedOrg.id}`,
        updatedOrg
      );
      const updatedData = response.data;
      organizationStore.updateOrganization(updatedData);
    } catch (error) {
      console.error("Error updating organization:", error);
      setError("Failed to update organization. Please try again later.");
    }
  };

  return {
    organizations,
    loading,
    error,
    handleNewOrganization,
    handleDeleteOrganization,
    handleUpdateOrganization,
  };
};

export default useGetOrganizations;