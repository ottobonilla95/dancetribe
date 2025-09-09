import { Suspense } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import CityList from "@/components/organisims/CityList";
// import FeaturesAccordion from "@/components/FeaturesAccordion";
// import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import connectMongo from "@/libs/mongoose";
import City from "@/models/City";
import Country from "@/models/Country";
import Continent from "@/models/Continent";
import { City as CityType } from "@/types";

async function getCities(): Promise<CityType[]> {
  console.log("🚀 getCities FUNCTION CALLED");
  try {
    await connectMongo();

    const cities = await City.find({ rank: { $gt: 0 } })
      .populate({ path: "country", model: Country, select: "name code" })
      .populate({ path: "continent", model: Continent, select: "name" })
      .sort({ rank: 1 })
      .limit(10)
      .lean();

    const result = cities.map((doc: any) => ({
      ...doc,
      _id: doc._id.toString(),
      country: { name: doc.country?.name || "", code: doc.country?.code || "" },
      continent: { name: doc.continent?.name || "" },
    }));

    return result;
  } catch (error) {
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
        <Hero />
        <CityList cities={cities} />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
