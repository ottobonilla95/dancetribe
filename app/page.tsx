import { Suspense } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import CityList from "@/components/organisims/CityList";
import FeaturesAccordion from "@/components/FeaturesAccordion";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import connectMongo from "@/libs/mongoose";
import City from "@/models/City";
import Country from "@/models/Country";
import Continent from "@/models/Continent";
import { City as CityType } from "@/types";

console.log("📦 PAGE MODULE LOADED");

async function getCities(): Promise<CityType[]> {
  console.log("🚀 getCities FUNCTION CALLED");
  try {
    console.log("🔄 About to connect to MongoDB...");
    await connectMongo();
    console.log("✅ Connected to MongoDB");

    console.log("🔍 Fetching cities...");
    const cities = await City.find({ rank: { $gt: 0 } })
      // .populate("country", "name code")
      // .populate("continent", "name")
      .sort({ rank: 1 })
      .limit(10)
      .lean();

    console.log(`📊 Found ${cities.length} cities`);

    const result = cities.map((doc: any) => ({
      ...doc,
      _id: doc._id.toString(),
      country: { name: "Unknown", code: "" },
      continent: { name: "Unknown" },
    }));

    console.log("✅ Cities processed successfully");
    return result;
  } catch (error) {
    console.error("❌ Error fetching cities:", error);
    return [];
  }
}

export default async function Home() {
  const cities: CityType[] = await getCities();

  console.log("cities", cities);
  console.log("cities", cities);
  console.log("cities", cities);

  return (
    <>
      <Suspense>
        <Header />
      </Suspense>
      <main>
        UPDATED3
        <div className="bg-black">
          <Hero />
        </div>
        <CityList cities={cities} />
        {/* <FeaturesAccordion /> */}
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
