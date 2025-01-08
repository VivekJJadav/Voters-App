import { useEffect, useState, useRef } from "react";
import axios from "axios";
import useAuthStore from "@/store/authStore";
import {
  Vote
} from "@prisma/client";
import { toast } from "sonner";

type Listener = () => void;

export const voteStore = {
  listeners: new Set<Listener>(),
  votes: [] as Vote[],

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  },

  notify() {
    this.listeners.forEach((listener) => listener());
  },

  setVotes(votes: Vote[]) {
    if (JSON.stringify(this.votes) !== JSON.stringify(votes)) {
      this.votes = votes;
      this.notify();
    }
  },

  addVote(vote: Vote) {
    this.votes = [...this.votes, vote];
    this.notify();
  },

  removeVote(id: string) {
    this.votes = this.votes.filter((vote) => vote.id !== id);
    this.notify();
  },

  updateVote(updatedVote: Vote) {
    const index = this.votes.findIndex((vote) => vote.id === updatedVote.id);
    if (
      index !== -1 &&
      JSON.stringify(this.votes[index]) !== JSON.stringify(updatedVote)
    ) {
      this.votes = this.votes.map((vote) =>
        vote.id === updatedVote.id ? updatedVote : vote
      );
      this.notify();
    }
  },
};

const useGetVotes = (organizationId: string) => {
  const user = useAuthStore((state) => state.user);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initialized = useRef(false);
  const prevOrgId = useRef(organizationId);

  useEffect(() => {
    if (prevOrgId.current !== organizationId) {
      initialized.current = false;
      prevOrgId.current = organizationId;
    }

    const fetchVotes = async () => {
      if (!user?.id || !organizationId) {
        setLoading(false);
        return;
      }

      if (!initialized.current) {
        setLoading(true);
        setError(null);

        try {
          const response = await axios.get("/api/vote", {
            headers: { organizationId },
          });

          const votes = response.data || [];
          voteStore.setVotes(votes);
          setVotes(votes);
          initialized.current = true;
        } catch (error) {
          console.error("Error fetching votes:", error);
          setError("Failed to fetch votes. Please try again later.");
          setVotes([]);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchVotes();

    const unsubscribe = voteStore.subscribe(() => {
      const newVotes = [...voteStore.votes];
      setVotes((prevVotes) => {
        if (JSON.stringify(prevVotes) !== JSON.stringify(newVotes)) {
          return newVotes;
        }
        return prevVotes;
      });
    });

    const unsubscribeAuth = useAuthStore.subscribe((state) => {
      if (state.user && initialized.current) {
        initialized.current = false;
        fetchVotes();
      }
    });

    return () => {
      unsubscribe();
      unsubscribeAuth();
      initialized.current = false;
    };
  }, [user?.id, organizationId]);

  const handleCreateVote = async (voteData: {
    name: string;
    description: string;
    candidates: { userId: string }[];
    startTime: Date;
    endTime: Date;
    isAnonymous: boolean;
    voteType: string;
  }) => {
    try {
      const response = await axios.post("/api/vote", {
        ...voteData,
        organizationId,
      });
      const createdVote = response.data;
      voteStore.addVote(createdVote);

      toast.success("Vote created successfully");
      return createdVote;
    } catch (error) {
      console.error("Error creating vote:", error);
      toast.error("Failed to create vote. Please try again later.");
      throw error;
    }
  };

  const handleDeleteVote = async (id: string) => {
    if (!organizationId) {
      toast.error("Organization ID is missing");
      return;
    }

    try {
      await axios.delete(`/api/vote`, {
        headers: {
          organizationId: organizationId,
          "Content-Type": "application/json",
        },
        data: { id },
      });

      voteStore.removeVote(id);
      toast.success("Vote deleted successfully");
    } catch (error) {
      console.error("Error deleting vote:", error);

      try {
        const response = await axios.get("/api/vote", {
          headers: { organizationId },
        });
        voteStore.setVotes(response.data || []);
      } catch (refreshError) {
        console.error("Error refreshing votes:", refreshError);
      }

      toast.error("Failed to delete vote");
      throw error;
    }
  };

  const handleUpdateVote = async (updatedVote: Vote) => {
    try {
      const response = await axios.put(`/api/vote`, updatedVote, {
        headers: { organizationId },
      });
      const updatedData = response.data;

      voteStore.updateVote(updatedData);
      return updatedData;
    } catch (error) {
      console.error("Error updating vote:", error);
      const response = await axios.get("/api/vote", {
        headers: { organizationId },
      });
      voteStore.setVotes(response.data || []);
      throw error;
    }
  };

  return {
    votes,
    loading,
    error,
    handleCreateVote,
    handleDeleteVote,
    handleUpdateVote,
  };
};

export default useGetVotes;
