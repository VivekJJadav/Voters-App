import { Toaster } from "sonner";
import Navbar from "@/app/(dashboard)/components/Navbar";

type Props = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: Props) {
  return (
    <div className="dashboard-app">
      <Navbar />
      <main className="relative z-10 min-h-screen">{children}</main>
      <Toaster />
    </div>
  );
}
