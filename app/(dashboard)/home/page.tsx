"use client";

import useAuthStore from "@/store/authStore";

const Marketing = () => {
  const user = useAuthStore((state) => state.user);

  // if (!user) {
  //   return (
  //     <div className="py-2 px-2 mt-28 flex flex-col sm:flex-row sm:space-x-2 fixed w-full bg-white">
  //       Not logged in
  //     </div>
  //   );
  // }

  return (
    <div className="py-2 px-2 mt-28 flex flex-col sm:flex-row sm:space-x-2 fixed w-full bg-white">
      <div className="text-slate-700 font-semibold text-xl md:text-2xl tracking-wide">
        Welcome {user?.name} 👋🏻
      </div>
    </div>
  );
};

export default Marketing;
