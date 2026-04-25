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
            "inline-block font-sans cursor-pointer text-white/75 hover:text-white text-base font-medium rounded-xl px-5 py-2.5 transform transition duration-300 ease-in-out hover:scale-105 hover:bg-white/10",
            pathname === href &&
              "bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white shadow-[0_8px_24px_rgba(102,126,234,0.28)] hover:from-[#764ba2] hover:to-[#667eea]"
          )}
        >
          {label}
        </span>
      </Link>
    </li>
  );
};

export default NavButton;
