import { Suspense } from "react";
import CountriesContent from "./CountriesContent";

export const dynamic = 'force-dynamic';

export default function CountriesPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    }>
      <CountriesContent />
    </Suspense>
  );
}
