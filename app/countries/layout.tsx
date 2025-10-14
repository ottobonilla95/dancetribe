import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Countries | DanceTribe - Find Dance Communities Worldwide",
  description: "Browse dance communities in countries around the world. Connect with dancers, find teachers, and explore popular dance styles globally.",
};

export default function CountriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {children}
    </div>
  );
}

