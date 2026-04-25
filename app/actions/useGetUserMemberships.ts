import { useEffect, useState } from "react";
import useAuthStore from "@/store/authStore";
import { Organization } from "@prisma/client";

const useGetUserMemberships = () => {
  const user = useAuthStore((state) => state.user);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [organizationsLoading, setOrganizationsLoading] = useState(true);

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        if (user?.email) {
          const params = new URLSearchParams({
            email: user.email,
            userId: user.id,
          });
          const res = await fetch(`/api/memberships?${params.toString()}`);
          const data = await res.json();
          setOrganizations(data);
        }
      } catch (error) {
        console.error("Failed to fetch memberships:", error);
      } finally {
        setOrganizationsLoading(false);
      }
    };

    if (user) {
      fetchOrgs();
    } else {
      setOrganizationsLoading(false);
    }
  }, [user]);

  return { organizations, organizationsLoading };
};

export default useGetUserMemberships;
