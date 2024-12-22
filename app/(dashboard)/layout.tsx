import { Toaster } from "sonner";
import Navbar from "@/app/(dashboard)/components/Navbar";

type Props = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: Props) {
  return (
    <>
      <Navbar />
      <div>{children}</div>
      <Toaster />
    </>
  );
}
