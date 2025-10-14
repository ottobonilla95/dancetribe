import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Country Dance Scene | DanceTribe",
  description: "Explore the dance community in countries around the world. Find dancers, teachers, and popular dance styles.",
};

export default function CountryLayout({
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

