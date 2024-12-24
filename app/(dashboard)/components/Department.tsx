import { Button } from "@/components/ui/button";
import { Department } from "@prisma/client";

interface DepartmentProps {
  dep: Department;
}

const Department = ({ dep }: DepartmentProps) => {
  return (
    <div
      key={dep.id}
      className="p-4 border-[1px] border-gray-400 rounded-lg bg-white shadow-sm flex items-center justify-between"
    >
      <h3 className="font-medium text-gray-800">{dep.name}</h3>
      <Button className="bg-red-500">Delete</Button>
    </div>
  );
};

export default Department;
