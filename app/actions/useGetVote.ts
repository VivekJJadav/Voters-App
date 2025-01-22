import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import useAuthStore from "@/store/authStore";
import { Vote, VoteCandidate } from "@prisma/client";
import { toast } from "sonner";

interface UseGetVoteProps {
  vote: Vote | null;
  loading: boolean;
  error: string | null;
  refreshVote: () => Promise<void>;
}

const useGetVote = (voteId: string): UseGetVoteProps => {
  const user = useAuthStore((state) => state.user);
  const [vote, setVote] = useState<Vote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVote = useCallback(async () => {
    if (!user?.id || !voteId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`/api/vote/${voteId}`);
      setVote(response.data);
    } catch (err) {
      console.error("Error fetching vote:", err);
      setError("Failed to fetch vote details. Please try again later.");
      setVote(null);
      toast.error("Failed to load vote details");
    } finally {
      setLoading(false);
    }
  }, [user?.id, voteId]);

  useEffect(() => {
    fetchVote();

    const unsubscribeAuth = useAuthStore.subscribe((state) => {
      if (state.user) {
        fetchVote();
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, [fetchVote]);

  return {
    vote,
    loading,
    error,
    refreshVote: fetchVote,
  };
};

export default useGetVote;