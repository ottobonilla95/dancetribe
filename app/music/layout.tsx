import { ReactNode } from "react";
import Header from "@/components/Header";

export default function MusicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="min-h-screen">{children}</main>
    </>
  );
}

