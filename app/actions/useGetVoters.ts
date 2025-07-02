import { useEffect, useState, useRef } from "react";
import axios from "axios";
import useAuthStore from "@/store/authStore";
import { User, UserDepartment, OrganizationMember } from "@prisma/client";
import { toast } from "sonner";

type Listener = () => void;

type VoterWithRelations = User & {
  departments: (UserDepartment & {
    department: {
      id: string;
      name: string;
      organizationId: string;
    };
  })[];
  organizations: OrganizationMember[];
};

export const voterStore = {
  listeners: new Set<Listener>(),
  voters: [] as VoterWithRelations[],

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  },

  notify() {
    this.listeners.forEach((listener) => listener());
  },

  setVoters(voters: VoterWithRelations[]) {
    if (JSON.stringify(this.voters) !== JSON.stringify(voters)) {
      this.voters = voters;
      this.notify();
    }
  },

  addVoter(voter: VoterWithRelations) {
    this.voters = [...this.voters, voter];
    this.notify();
  },

  removeVoter(id: string) {
    this.voters = this.voters.filter((voter) => voter.id !== id);
    this.notify();
  },

  clearVoters() {
    this.voters = [];
    this.notify();
  },

  updateVoter(updatedVoter: VoterWithRelations) {
    const index = this.voters.findIndex(
      (voter) => voter.id === updatedVoter.id
    );
    if (
      index !== -1 &&
      JSON.stringify(this.voters[index]) !== JSON.stringify(updatedVoter)
    ) {
      this.voters = this.voters.map((voter) =>
        voter.id === updatedVoter.id ? updatedVoter : voter
      );
      this.notify();
    }
  },
};

const useGetVoters = (organizationId: string) => {
  const user = useAuthStore((state) => state.user);
  const [voters, setVoters] = useState<VoterWithRelations[]>([]);
  const [votersLoading, setVotersLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initialized = useRef(false);
  const prevOrgId = useRef(organizationId);

  useEffect(() => {
    if (prevOrgId.current !== organizationId) {
      setVoters([]);
      voterStore.clearVoters();
      setVotersLoading(true);
      prevOrgId.current = organizationId;
    }

    const api = axios.create({
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    });

    const fetchVoters = async () => {
      if (!user?.id || !organizationId) {
        setVotersLoading(false);
        return;
      }

      if (!initialized.current) {
        setVotersLoading(true);
        setError(null);

        try {
          const response = await api.get("/api/voters", {
            headers: { organizationId },
          });


          const voters = response.data || [];
          voterStore.setVoters(voters);
          setVoters(voters);
          initialized.current = true;
        } catch (error: any) {
          console.error("Error fetching voters:", error);
          if (error.response?.status === 401) {
            window.location.href = "/sign-in";
            return;
          }
          setError(error.response?.data?.error || "Failed to fetch voters");
        } finally {
          setVotersLoading(false);
        }
      }
    };

    fetchVoters();

    const unsubscribe = voterStore.subscribe(() => {
      const newVoters = [...voterStore.voters];
      setVoters((prevVoters) => {
        if (JSON.stringify(prevVoters) !== JSON.stringify(newVoters)) {
          return newVoters;
        }
        return prevVoters;
      });
    });

    const unsubscribeAuth = useAuthStore.subscribe((state) => {
      if (state.user && initialized.current) {
        initialized.current = false;
        fetchVoters();
      }
    });

    return () => {
      unsubscribe();
      unsubscribeAuth();
      initialized.current = false;
    };
  }, [user?.id, organizationId]);

  const handleAddVoter = async (
    voterData: Partial<User & { departmentIds: string[] }>
  ) => {
    try {
      const response = await axios.post("/api/voters", {
        ...voterData,
        organizationId,
      });
      const createdVoter = response.data;
      voterStore.addVoter(createdVoter);

      toast.success("Voter added to organization successfully");
      return createdVoter;
    } catch (error) {
      console.error("Error adding voter:", error);
      toast.error("Failed to add voter. Please try again later.");
      throw error;
    }
  };

  const handleRemoveVoter = async (id: string) => {
    if (!organizationId) {
      toast.error("Organization ID is missing");
      return;
    }

    try {
      await axios.delete("/api/voters", {
        headers: {
          organizationId: organizationId,
          "Content-Type": "application/json",
        },
        data: { id },
      });

      voterStore.removeVoter(id);
      toast.success("Voter removed from organization successfully");
    } catch (error) {
      console.error("Error removing voter:", error);

      try {
        const response = await axios.get("/api/voters", {
          headers: { organizationId },
        });
        voterStore.setVoters(response.data || []);
      } catch (refreshError) {
        console.error("Error refreshing voters:", refreshError);
      }

      toast.error("Failed to remove voter");
      throw error;
    }
  };

  const handleUpdateVoter = async (updatedVoter: VoterWithRelations) => {
    try {
      const response = await axios.put(`/api/voters`, updatedVoter, {
        headers: { organizationId },
      });
      const updatedData = response.data;

      voterStore.updateVoter(updatedData);
      return updatedData;
    } catch (error) {
      console.error("Error updating voter:", error);
      const response = await axios.get("/api/voters", {
        headers: { organizationId },
      });
      voterStore.setVoters(response.data || []);
      throw error;
    }
  };

  return {
    voters,
    votersLoading,
    error,
    handleAddVoter,
    handleRemoveVoter,
    handleUpdateVoter,
  };
};

export default useGetVoters;
