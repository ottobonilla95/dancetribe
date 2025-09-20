import ButtonAccount from "@/components/ButtonAccount";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import City from "@/models/City";
import Country from "@/models/Country";
import Continent from "@/models/Continent";
import { City as CityType } from "@/types";
import Link from "next/link";
import CityList from "@/components/organisims/CityList";

export const dynamic = "force-dynamic";

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

// This is a private page: It's protected by the layout.js component which ensures the user is authenticated.
// It's a server compoment which means you can fetch data (like the user profile) before the page is rendered.
// See https://shipfa.st/docs/tutorials/private-page
export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  // Check if user profile is complete
  try {
    await connectMongo();
    const user = await User.findById(session.user.id);

    if (user && !user.isProfileComplete) {
      // Redirect to onboarding if profile is not complete
      redirect("/onboarding");
    }
  } catch (error) {
    console.error("Error checking user profile:", error);
  }

  // Fetch cities for the city list
  const cities: CityType[] = await getCities();

  return (
    <main className="min-h-screen pb-24 py-8">
      <section className="mx-auto space-y-8">
        <h1 className="text-3xl md:text-4xl font-extrabold px-8">
          Welcome to DanceTribe!
        </h1>
        <CityList cities={cities} />
        {/* Welcome Message */}
        <div className="text-center px-8">
          <p className="text-lg text-base-content/70 mb-6">
            Ready to explore the dance community? Use the menu to navigate
            around!
          </p>
          <div className="flex gap-4 justify-center flex-wrap mb-8">
            <Link href="/profile" className="btn btn-primary btn-lg">
              👤 View My Profile
            </Link>
            <Link href="/friends" className="btn btn-secondary btn-lg">
              👥 Manage Friends
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
