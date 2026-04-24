import client from "@/app/libs/prismadb";

export async function getUserWithMemberships(userId: string) {
  const user = await client.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return null;
  }

  const [memberships, userDepartments] = await Promise.all([
    client.organizationMember.findMany({
      where: { userId },
    }),
    client.userDepartment.findMany({
      where: { userId },
    }),
  ]);

  const organizationIds = [...new Set(memberships.map((m) => m.organizationId))];
  const departmentIds = [...new Set(userDepartments.map((d) => d.departmentId))];

  const [organizations, departments] = await Promise.all([
    organizationIds.length
      ? client.organization.findMany({
          where: { id: { in: organizationIds } },
          include: { departments: true },
        })
      : [],
    departmentIds.length
      ? client.department.findMany({
          where: { id: { in: departmentIds } },
        })
      : [],
  ]);

  const organizationById = new Map(
    organizations.map((organization) => [organization.id, organization])
  );
  const departmentById = new Map(
    departments.map((department) => [department.id, department])
  );

  return {
    ...user,
    organizations: memberships
      .map((membership) => {
        const organization = organizationById.get(membership.organizationId);
        return organization ? { ...membership, organization } : null;
      })
      .filter(Boolean),
    departments: userDepartments
      .map((userDepartment) => {
        const department = departmentById.get(userDepartment.departmentId);
        return department ? { ...userDepartment, department } : null;
      })
      .filter(Boolean),
  };
}
