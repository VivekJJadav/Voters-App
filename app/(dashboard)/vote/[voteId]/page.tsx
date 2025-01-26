"use client";

import { useParams } from "next/navigation";

const VotePage = () => {
  const { voteId } = useParams();

  return (
    <div>
      <div className=" flex font-semibold text-2xl pt-32 pb-7 mb-5 font-sans bg-orange-700 items-center justify-center">
        Vote Name
      </div>
      <div className="flex m-5 p-3">
        <div className="relative w-72 h-40 bg-slate-300 rounded-2xl p-4 shadow-lg transition-transform transform hover:scale-105 hover:shadow-2xl">

          <div className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-green-600 border-green-400 hover:bg-green-700 hover:border-green-500"></div>

          <div className="bg-white px-4 py-2 w-60 rounded-lg text-lg font-bold text-gray-800 shadow-md">
            {/* {candidate.name} */} Name
          </div>

          <div
            className="bg-gray-100 px-4 py-3 mt-3 w-52 rounded-lg text-sm text-gray-800 shadow-md"
          >
            {/* {candidate.description} */} Description
          </div>

          <button className="absolute bottom-4 right-4 w-10 h-10 bg-gray-800 text-white font-bold rounded-full shadow-md transition-transform hover:scale-110 hover:bg-gray-900">
            
          </button>
        </div>
      </div>
    </div>
  );
};

export default VotePage;
