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
        "font-sans cursor-pointer text-slate-100 text-base rounded-md hover:bg-white/20 px-3 py-2",
        pathname === href && "bg-white/10"
      )}
    >
      <Link href={href}>{label}</Link>
    </li>
  );
};

export default NavButton;
