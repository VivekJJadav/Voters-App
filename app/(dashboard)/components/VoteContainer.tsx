"use client";

import useGetVote from "@/app/actions/useGetVote";
import { Vote as VoteIcon } from "lucide-react";
import { Vote as VoteModel } from "@prisma/client";

interface VoteContainerProps {
  currentVote: VoteModel;
  onClick: () => void;
}

const VoteContainer = ({ currentVote, onClick }: VoteContainerProps) => {
  const { vote } = useGetVote(currentVote.id);
  const displayVote = vote || currentVote;

  const getStatusInfo = () => {
    if (!displayVote) return { isActive: false, display: null };

    const now = new Date();
    const startTime = new Date(displayVote.startTime);
    const effectiveEndTime = displayVote.extendedTime || displayVote.endTime;
    const endTime = effectiveEndTime ? new Date(effectiveEndTime) : null;
    const isUpcoming = startTime > now;
    const isActive = !isUpcoming && (!endTime || endTime > now);

    return {
      isActive,
      display: isActive ? (
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-sm font-semibold text-emerald-200">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" />
          Live
        </span>
      ) : isUpcoming ? (
        <span className="inline-flex items-center gap-2 rounded-full border border-sky-300/20 bg-sky-400/10 px-3 py-1 text-sm font-semibold text-sky-100">
          <span className="h-2.5 w-2.5 rounded-full bg-sky-300" />
          Upcoming
        </span>
      ) : (
        <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-3 py-1 text-sm font-semibold text-white/60">
          <span className="h-2.5 w-2.5 rounded-full bg-white/40" />
          Ended
        </span>
      )
    };
  };

  const statusInfo = getStatusInfo();
  const isActive = statusInfo.isActive;
  const description = displayVote.description?.trim();

  return (
    <div
      onClick={isActive ? onClick : undefined}
      className={`group relative min-h-[11rem] w-full overflow-hidden rounded-lg border p-5 shadow-[0_18px_50px_rgba(15,12,41,0.24)] transition-all duration-300 ease-out ${
        isActive
          ? "cursor-pointer border-white/12 bg-white/[0.075] hover:border-white/24 hover:bg-white/[0.105] hover:shadow-[0_22px_60px_rgba(15,12,41,0.32)]"
          : "cursor-not-allowed border-white/[0.08] bg-white/[0.045] opacity-70"
        }`}
    >
      <div className="absolute right-5 top-5 flex items-center">
        {statusInfo.display}
      </div>

      <div className="flex min-h-[8.5rem] flex-col justify-between gap-5 pr-0 sm:pr-28">
        <div className="space-y-4">
          <h3
            className={`break-words pr-28 text-xl font-bold ${
              isActive ? "text-white" : "text-white/50"
            }`}
          >
            {displayVote.name}
          </h3>

          {description && (
            <p
              className={`break-words rounded-lg border px-4 py-3 text-sm leading-6 ${
                isActive
                  ? "border-white/10 bg-white/[0.06] text-white/70"
                  : "border-white/[0.08] bg-white/[0.035] text-white/40"
              }`}
            >
              {description}
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <button
            className={`flex h-12 w-12 items-center justify-center rounded-full shadow-[0_12px_30px_rgba(15,12,41,0.26)] transition-all duration-300 ${
              isActive
                ? "bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white hover:scale-105"
                : "cursor-not-allowed bg-white/[0.08] text-white/40"
            }`}
            disabled={!isActive}
            aria-label={isActive ? `Open ${displayVote.name}` : `${displayVote.name} is not open`}
          >
            <VoteIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {isActive && (
        <div
          className="pointer-events-none absolute inset-0 rounded-lg bg-gradient-to-br from-white/0 via-white/0 to-[#8b9cf7]/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
      )}
    </div>
  );
};

export default VoteContainer;
