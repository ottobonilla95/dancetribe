import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Countries | DanceCircle - Find Dance Communities Worldwide",
  description: "Browse dance communities in countries around the world. Connect with dancers, find teachers, and explore popular dance styles globally.",
};

export default function CountriesLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div>
      {children}
    </div>
  );
}

