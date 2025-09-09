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
import { City as CityType } from "@/types";

async function getCities(): Promise<CityType[]> {
  try {
    await connectMongo();

    console.log("🔄 Connecting to MongoDB...");
    await connectMongo();

    console.log("🔄 Fetching cities...");
    const cities = await City.find({ rank: { $gt: 0 } })
      .populate("country", "name code")
      .populate("continent", "name")
      .sort({ rank: 1 })
      .limit(10)
      .lean();

    console.log("🔄 Cities fetched:", cities.length);

    return cities.map((doc: any) => ({
      ...doc,
      _id: doc._id.toString(),
      country: { name: doc.country?.name || "", code: doc.country?.code || "" },
      continent: { name: doc.continent?.name || "" },
    }));
  } catch (error) {
    console.error("Error fetching cities:", error);
    return [];
  }
}

export default async function Home() {
  const cities: CityType[] = await getCities();

  return (
    <>
      <Suspense>
        <Header />
      </Suspense>
      <main>
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
