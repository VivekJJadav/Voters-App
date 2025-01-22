import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  href: string;
  label: string;
};

const NavButton = ({ href, label }: Props) => {
  const pathname = usePathname();
  return (
    <li
      className={cn(
        "font-sans cursor-pointer text-slate-100 text-base rounded-md transform transition duration-300 ease-in-out hover:bg-blue-500 hover:scale-110 px-3 py-2",
        pathname === href && "bg-white/10"
      )}
    >
      <Link href={href}>{label}</Link>
    </li>
  );
};

export default NavButton;
