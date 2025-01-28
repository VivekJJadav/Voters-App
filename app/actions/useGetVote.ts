import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import useAuthStore from "@/store/authStore";
import {
  Department,
  Prisma,
  Slogan,
  Vote,
  VoteCandidate,
  VoteResult,
  VoteType,
} from "@prisma/client";
import { toast } from "sonner";

const voteWithRelations = Prisma.validator<Prisma.VoteArgs>()({
  include: {
    candidates: {
      include: {
        user: true,
      },
    },
    results: {
      include: {
        candidate: true,
      },
    },
    slogans: {
      include: {
        user: true,
      },
    },
    organization: true,
    department: true,
  },
});

type VoteWithRelations = Prisma.VoteGetPayload<typeof voteWithRelations>;

interface UseGetVoteProps {
  vote: VoteWithRelations | null;
  loading: boolean;
  error: string | null;
  refreshVote: () => Promise<void>;
}

const useGetVote = (voteId: string | undefined): UseGetVoteProps => {
  const user = useAuthStore((state) => state.user);
  const [vote, setVote] = useState<VoteWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVote = useCallback(async () => {
    if (!user || !voteId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get<VoteWithRelations>(`/api/vote/${voteId}`, {
        headers: { userId: user.id },
      });
      setVote(response.data);
    } catch (err) {
      console.error("Error fetching vote:", err);
      const errorMessage =
        axios.isAxiosError(err) && err.response?.status === 404
          ? "Vote not found"
          : "Failed to fetch vote details. Please try again later.";

      setError(errorMessage);
      setVote(null);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, voteId]);

  useEffect(() => {
    fetchVote();

    const unsubscribe = useAuthStore.subscribe((state) => {
      if (state.user) {
        fetchVote();
      }
    });

    return () => {
      unsubscribe();
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
