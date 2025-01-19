"use client";

import { useParams } from "next/navigation";

const VotePage = () => {
  const { voteId } = useParams();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full mx-4">
        <h1 className="text-3xl font-bold text-center mb-4">Vote Page</h1>
        <p className="text-gray-600 text-center">Vote ID: {voteId}</p>
      </div>
    </div>
  );
};

export default VotePage;
