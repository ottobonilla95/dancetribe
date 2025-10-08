import { ReactNode, Suspense } from "react";
import Header from "@/components/Header";

// Layout for cities pages - Requires authentication
export default async function CitiesLayout({
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
