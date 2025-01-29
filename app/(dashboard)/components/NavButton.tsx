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
    <li className="list-none">
      <Link href={href}>
        <span
          className={cn(
            "inline-block font-sans cursor-pointer text-white hover:text-black text-base font-medium rounded-lg px-5 py-2.5 transform transition duration-300 ease-in-out hover:scale-105 hover:bg-slate-300",
            pathname === href && "bg-slate-300 text-black hover:bg-slate-300"
          )}
        >
          {label}
        </span>
      </Link>
    </li>
  );
};

export default NavButton;
