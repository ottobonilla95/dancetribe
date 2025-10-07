import { ReactNode, Suspense } from "react";
import Header from "@/components/Header";

// Layout for dance style pages
// Shows Header only for authenticated users
export default async function DanceStyleLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <Suspense>
        <Header />
      </Suspense>

      {children}
    </>
  );
}
