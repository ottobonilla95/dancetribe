import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import City from "@/models/City";
import Country from "@/models/Country";
import Continent from "@/models/Continent";

// Function to normalize text by removing accents and special characters
function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics/accents
    .toLowerCase()
    .trim();
}

// GET /api/cities - Fetch cities, optionally filtered by country or continent
export async function GET(request: Request) {
  try {
    await connectMongo();

    const { searchParams } = new URL(request.url);
    const countryId = searchParams.get('country');
    const continentId = searchParams.get('continent');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '10');

    let query: any = { isActive: true };
    
    if (countryId) {
      query.country = countryId;
    }
    if (continentId) {
      query.continent = continentId;
    }

    let cities;

    if (search) {
      // When searching, get all matching cities and then sort/limit
      const normalizedSearch = normalizeText(search);
      
      // Create a regex pattern that matches the normalized search in the normalized city name
      // We'll use MongoDB aggregation to normalize city names on the fly
      cities = await City.aggregate([
        {
          $match: query // Apply initial filters
        },
        {
          $addFields: {
            normalizedName: {
              $toLower: {
                $trim: {
                  input: {
                    $replaceAll: {
                      input: {
                        $replaceAll: {
                          input: {
                            $replaceAll: {
                              input: {
                                $replaceAll: {
                                  input: {
                                    $replaceAll: {
                                      input: {
                                        $replaceAll: {
                                          input: {
                                            $replaceAll: {
                                              input: {
                                                $replaceAll: {
                                                  input: "$name",
                                                  find: "á",
                                                  replacement: "a"
                                                }
                                              },
                                              find: "é", 
                                              replacement: "e"
                                            }
                                          },
                                          find: "í",
                                          replacement: "i"
                                        }
                                      },
                                      find: "ó",
                                      replacement: "o"
                                    }
                                  },
                                  find: "ú",
                                  replacement: "u"
                                }
                              },
                              find: "ñ",
                              replacement: "n"
                            }
                          },
                          find: "ü",
                          replacement: "u"
                        }
                      },
                      find: "ç",
                      replacement: "c"
                    }
                  }
                }
              }
            }
          }
        },
        {
          $match: {
            normalizedName: { $regex: normalizedSearch, $options: 'i' }
          }
        },
        {
          $lookup: {
            from: "countries",
            localField: "country",
            foreignField: "_id", 
            as: "country",
            pipeline: [{ $project: { name: 1, code: 1 } }]
          }
        },
        {
          $lookup: {
            from: "continents",
            localField: "continent", 
            foreignField: "_id",
            as: "continent",
            pipeline: [{ $project: { name: 1, code: 1 } }]
          }
        },
        {
          $unwind: { path: "$country", preserveNullAndEmptyArrays: true }
        },
        {
          $unwind: { path: "$continent", preserveNullAndEmptyArrays: true }
        },
        {
          $project: {
            normalizedName: 0 // Remove the temporary field
          }
        },
        {
          $sort: { rank: 1, population: -1 }
        },
        {
          $limit: limit
        }
      ]);
    } else {
      // No search - use regular find
      cities = await City.find(query)
        .populate({
          path: "country",
          model: Country,
          select: "name code",
        })
        .populate({
          path: "continent",
          model: Continent,
          select: "name code",
        })
        .sort({ rank: 1, population: -1 })
        .limit(limit)
        .lean();
    }

    return NextResponse.json({ cities });
  } catch (error) {
    console.error("Error fetching cities:", error);
    return NextResponse.json(
      { error: "Failed to fetch cities" },
      { status: 500 }
    );
  }
}
