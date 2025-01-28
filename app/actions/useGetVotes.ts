import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import useAuthStore from "@/store/authStore";
import { Vote } from "@prisma/client";
import { toast } from "sonner";

interface VoteData {
  name: string;
  description: string;
  candidates: { userId: string }[];
  startTime: Date;
  endTime: Date;
  isAnonymous: boolean;
  voteType: string;
}

interface UseGetVotesProps {
  votes: Vote[];
  loading: boolean;
  error: string | null;
  createVote: (data: VoteData) => Promise<Vote>;
  deleteVote: (id: string) => Promise<void>;
  updateVote: (vote: Vote) => Promise<Vote>;
  refreshVotes: () => Promise<void>;
}

const useGetVotes = (organizationId: string): UseGetVotesProps => {
  const user = useAuthStore((state) => state.user);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVotes = useCallback(async () => {
    if (!user?.id || !organizationId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get("/api/vote", {
        headers: { organizationId, userId: user.id },
      });
      setVotes(response.data || []);
    } catch (err) {
      console.error("Error fetching votes:", err);
      setError("Failed to fetch votes. Please try again later.");
      setVotes([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, organizationId]);

  useEffect(() => {
    fetchVotes();

    const unsubscribeAuth = useAuthStore.subscribe((state) => {
      if (state.user) {
        fetchVotes();
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, [fetchVotes, organizationId]);

  const createVote = async (voteData: VoteData): Promise<Vote> => {
    try {
      const response = await axios.post("/api/vote", {
        ...voteData,
        organizationId,
      });

      const createdVote = response.data;
      setVotes((current) => [...current, createdVote]);
      toast.success("Vote created successfully");

      return createdVote;
    } catch (err) {
      console.error("Error creating vote:", err);
      toast.error("Failed to create vote. Please try again later.");
      throw err;
    }
  };

  const deleteVote = async (id: string): Promise<void> => {
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

      setVotes((current) => current.filter((vote) => vote.id !== id));
      toast.success("Vote deleted successfully");
    } catch (err) {
      console.error("Error deleting vote:", err);
      toast.error("Failed to delete vote");
      await fetchVotes();
      throw err;
    }
  };

  const updateVote = async (updatedVote: Vote): Promise<Vote> => {
    try {
      const response = await axios.put(`/api/vote`, updatedVote, {
        headers: { organizationId },
      });

      const updatedData = response.data;
      setVotes((current) =>
        current.map((vote) => (vote.id === updatedData.id ? updatedData : vote))
      );

      return updatedData;
    } catch (err) {
      console.error("Error updating vote:", err);
      await fetchVotes();
      throw err;
    }
  };

  return {
    votes,
    loading,
    error,
    createVote,
    deleteVote,
    updateVote,
    refreshVotes: fetchVotes,
  };
};

export default useGetVotes;
