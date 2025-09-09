import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import connectMongo from "../libs/mongoose";
import Continent from "../models/Continent";
import Country from "../models/Country";
import City from "../models/City";

const continents = [
  { name: "Asia", code: "AS", totalDancers: 0 },
  { name: "Europe", code: "EU", totalDancers: 0 },
  { name: "North America", code: "NA", totalDancers: 0 },
  { name: "South America", code: "SA", totalDancers: 0 },
  { name: "Africa", code: "AF", totalDancers: 0 },
  { name: "Oceania", code: "OC", totalDancers: 0 },
];

const countries = [
  // Asia
  { name: "Japan", code: "JP", continentCode: "AS" },
  { name: "South Korea", code: "KR", continentCode: "AS" },
  { name: "China", code: "CN", continentCode: "AS" },
  { name: "India", code: "IN", continentCode: "AS" },
  { name: "Thailand", code: "TH", continentCode: "AS" },
  { name: "Singapore", code: "SG", continentCode: "AS" },
  { name: "Philippines", code: "PH", continentCode: "AS" },
  { name: "Indonesia", code: "ID", continentCode: "AS" },
  { name: "Malaysia", code: "MY", continentCode: "AS" },
  { name: "Vietnam", code: "VN", continentCode: "AS" },
  { name: "Taiwan", code: "TW", continentCode: "AS" },
  { name: "Hong Kong", code: "HK", continentCode: "AS" },
  { name: "Laos", code: "LA", continentCode: "AS" },
  
  // Europe
  { name: "Germany", code: "DE", continentCode: "EU" },
  { name: "United Kingdom", code: "GB", continentCode: "EU" },
  { name: "France", code: "FR", continentCode: "EU" },
  { name: "Spain", code: "ES", continentCode: "EU" },
  { name: "Italy", code: "IT", continentCode: "EU" },
  { name: "Netherlands", code: "NL", continentCode: "EU" },
  { name: "Sweden", code: "SE", continentCode: "EU" },
  { name: "Norway", code: "NO", continentCode: "EU" },
  { name: "Poland", code: "PL", continentCode: "EU" },
  { name: "Russia", code: "RU", continentCode: "EU" },
  { name: "Austria", code: "AT", continentCode: "EU" },
  { name: "Belgium", code: "BE", continentCode: "EU" },
  { name: "Switzerland", code: "CH", continentCode: "EU" },
  { name: "Denmark", code: "DK", continentCode: "EU" },
  { name: "Finland", code: "FI", continentCode: "EU" },
  { name: "Portugal", code: "PT", continentCode: "EU" },
  { name: "Greece", code: "GR", continentCode: "EU" },
  { name: "Czech Republic", code: "CZ", continentCode: "EU" },
  { name: "Hungary", code: "HU", continentCode: "EU" },
  { name: "Romania", code: "RO", continentCode: "EU" },
  { name: "Bulgaria", code: "BG", continentCode: "EU" },
  { name: "Croatia", code: "HR", continentCode: "EU" },
  { name: "Slovenia", code: "SI", continentCode: "EU" },
  { name: "Slovakia", code: "SK", continentCode: "EU" },
  { name: "Lithuania", code: "LT", continentCode: "EU" },
  { name: "Latvia", code: "LV", continentCode: "EU" },
  { name: "Estonia", code: "EE", continentCode: "EU" },
  { name: "Ireland", code: "IE", continentCode: "EU" },
  { name: "Iceland", code: "IS", continentCode: "EU" },
  { name: "Luxembourg", code: "LU", continentCode: "EU" },
  { name: "Malta", code: "MT", continentCode: "EU" },
  { name: "Cyprus", code: "CY", continentCode: "EU" },
  { name: "Albania", code: "AL", continentCode: "EU" },
  { name: "Serbia", code: "RS", continentCode: "EU" },
  { name: "Montenegro", code: "ME", continentCode: "EU" },
  { name: "North Macedonia", code: "MK", continentCode: "EU" },
  { name: "Bosnia and Herzegovina", code: "BA", continentCode: "EU" },
  { name: "Ukraine", code: "UA", continentCode: "EU" },
  { name: "Belarus", code: "BY", continentCode: "EU" },
  { name: "Moldova", code: "MD", continentCode: "EU" },
  { name: "Turkey", code: "TR", continentCode: "EU" },
  
  // North America
  { name: "United States", code: "US", continentCode: "NA" },
  { name: "Canada", code: "CA", continentCode: "NA" },
  { name: "Mexico", code: "MX", continentCode: "NA" },
  { name: "Costa Rica", code: "CR", continentCode: "NA" },
  { name: "Panama", code: "PA", continentCode: "NA" },
  { name: "Dominican Republic", code: "DO", continentCode: "NA" },
  { name: "Puerto Rico", code: "PR", continentCode: "NA" },
  { name: "Trinidad and Tobago", code: "TT", continentCode: "NA" },
  { name: "Barbados", code: "BB", continentCode: "NA" },
  
  // South America
  { name: "Brazil", code: "BR", continentCode: "SA" },
  { name: "Argentina", code: "AR", continentCode: "SA" },
  { name: "Chile", code: "CL", continentCode: "SA" },
  { name: "Colombia", code: "CO", continentCode: "SA" },
  { name: "Peru", code: "PE", continentCode: "SA" },
  { name: "Venezuela", code: "VE", continentCode: "SA" },
  { name: "Ecuador", code: "EC", continentCode: "SA" },
  { name: "Bolivia", code: "BO", continentCode: "SA" },
  { name: "Paraguay", code: "PY", continentCode: "SA" },
  { name: "Uruguay", code: "UY", continentCode: "SA" },
  
  // Africa
  { name: "South Africa", code: "ZA", continentCode: "AF" },
  { name: "Nigeria", code: "NG", continentCode: "AF" },
  { name: "Egypt", code: "EG", continentCode: "AF" },
  { name: "Morocco", code: "MA", continentCode: "AF" },
  { name: "Tunisia", code: "TN", continentCode: "AF" },
  
  // Oceania
  { name: "Australia", code: "AU", continentCode: "OC" },
  { name: "New Zealand", code: "NZ", continentCode: "OC" },
  
  // Middle East
  { name: "Israel", code: "IL", continentCode: "AS" },
  { name: "United Arab Emirates", code: "AE", continentCode: "AS" },
];

// Cities data with varying numbers based on dance community size
const cities = [
  // United States (15 cities - huge dance community)
  { name: "New York", countryCode: "US", continentCode: "NA", population: 8398748, rank: 1 },
  { name: "Los Angeles", countryCode: "US", continentCode: "NA", population: 3980780, rank: 2 },
  { name: "Chicago", countryCode: "US", continentCode: "NA", population: 2693976, rank: 3 },
  { name: "Houston", countryCode: "US", continentCode: "NA", population: 2320268, rank: 4 },
  { name: "Phoenix", countryCode: "US", continentCode: "NA", population: 1608139, rank: 5 },
  { name: "Philadelphia", countryCode: "US", continentCode: "NA", population: 1584064, rank: 6 },
  { name: "San Antonio", countryCode: "US", continentCode: "NA", population: 1547253, rank: 7 },
  { name: "San Diego", countryCode: "US", continentCode: "NA", population: 1423856, rank: 8 },
  { name: "Dallas", countryCode: "US", continentCode: "NA", population: 1343573, rank: 9 },
  { name: "San Jose", countryCode: "US", continentCode: "NA", population: 1030119, rank: 10 },
  { name: "Austin", countryCode: "US", continentCode: "NA", population: 978908, rank: 11 },
  { name: "Jacksonville", countryCode: "US", continentCode: "NA", population: 949611, rank: 12 },
  { name: "Fort Worth", countryCode: "US", continentCode: "NA", population: 918915, rank: 13 },
  { name: "Columbus", countryCode: "US", continentCode: "NA", population: 898553, rank: 14 },
  { name: "Charlotte", countryCode: "US", continentCode: "NA", population: 885708, rank: 15 },

  // Spain (15 cities - huge dance community)
  { name: "Madrid", countryCode: "ES", continentCode: "EU", population: 3223334, rank: 1 },
  { name: "Barcelona", countryCode: "ES", continentCode: "EU", population: 1636762, rank: 2 },
  { name: "Valencia", countryCode: "ES", continentCode: "EU", population: 789744, rank: 3 },
  { name: "Seville", countryCode: "ES", continentCode: "EU", population: 688711, rank: 4 },
  { name: "Zaragoza", countryCode: "ES", continentCode: "EU", population: 674997, rank: 5 },
  { name: "Málaga", countryCode: "ES", continentCode: "EU", population: 577405, rank: 6 },
  { name: "Murcia", countryCode: "ES", continentCode: "EU", population: 459403, rank: 7 },
  { name: "Palma", countryCode: "ES", continentCode: "EU", population: 416873, rank: 8 },
  { name: "Las Palmas", countryCode: "ES", continentCode: "EU", population: 381847, rank: 9 },
  { name: "Bilbao", countryCode: "ES", continentCode: "EU", population: 350184, rank: 10 },
  { name: "Alicante", countryCode: "ES", continentCode: "EU", population: 337304, rank: 11 },
  { name: "Córdoba", countryCode: "ES", continentCode: "EU", population: 325916, rank: 12 },
  { name: "Valladolid", countryCode: "ES", continentCode: "EU", population: 298412, rank: 13 },
  { name: "Vigo", countryCode: "ES", continentCode: "EU", population: 295364, rank: 14 },
  { name: "Gijón", countryCode: "ES", continentCode: "EU", population: 271843, rank: 15 },

  // France (15 cities - huge dance community)
  { name: "Paris", countryCode: "FR", continentCode: "EU", population: 2140526, rank: 1 },
  { name: "Marseille", countryCode: "FR", continentCode: "EU", population: 870731, rank: 2 },
  { name: "Lyon", countryCode: "FR", continentCode: "EU", population: 522969, rank: 3 },
  { name: "Toulouse", countryCode: "FR", continentCode: "EU", population: 479553, rank: 4 },
  { name: "Nice", countryCode: "FR", continentCode: "EU", population: 340017, rank: 5 },
  { name: "Nantes", countryCode: "FR", continentCode: "EU", population: 320732, rank: 6 },
  { name: "Strasbourg", countryCode: "FR", continentCode: "EU", population: 287228, rank: 7 },
  { name: "Montpellier", countryCode: "FR", continentCode: "EU", population: 295542, rank: 8 },
  { name: "Bordeaux", countryCode: "FR", continentCode: "EU", population: 257068, rank: 9 },
  { name: "Lille", countryCode: "FR", continentCode: "EU", population: 233098, rank: 10 },
  { name: "Rennes", countryCode: "FR", continentCode: "EU", population: 217728, rank: 11 },
  { name: "Reims", countryCode: "FR", continentCode: "EU", population: 182592, rank: 12 },
  { name: "Toulon", countryCode: "FR", continentCode: "EU", population: 171953, rank: 13 },
  { name: "Saint-Étienne", countryCode: "FR", continentCode: "EU", population: 170761, rank: 14 },
  { name: "Le Havre", countryCode: "FR", continentCode: "EU", population: 170147, rank: 15 },

  // United Kingdom (15 cities - huge dance community)
  { name: "London", countryCode: "GB", continentCode: "EU", population: 8982000, rank: 1 },
  { name: "Birmingham", countryCode: "GB", continentCode: "EU", population: 1141000, rank: 2 },
  { name: "Manchester", countryCode: "GB", continentCode: "EU", population: 547600, rank: 3 },
  { name: "Glasgow", countryCode: "GB", continentCode: "EU", population: 626410, rank: 4 },
  { name: "Liverpool", countryCode: "GB", continentCode: "EU", population: 513441, rank: 5 },
  { name: "Leeds", countryCode: "GB", continentCode: "EU", population: 793139, rank: 6 },
  { name: "Sheffield", countryCode: "GB", continentCode: "EU", population: 582506, rank: 7 },
  { name: "Edinburgh", countryCode: "GB", continentCode: "EU", population: 536775, rank: 8 },
  { name: "Bristol", countryCode: "GB", continentCode: "EU", population: 471916, rank: 9 },
  { name: "Cardiff", countryCode: "GB", continentCode: "EU", population: 366903, rank: 10 },
  { name: "Leicester", countryCode: "GB", continentCode: "EU", population: 368600, rank: 11 },
  { name: "Coventry", countryCode: "GB", continentCode: "EU", population: 362690, rank: 12 },
  { name: "Newcastle", countryCode: "GB", continentCode: "EU", population: 322278, rank: 13 },
  { name: "Nottingham", countryCode: "GB", continentCode: "EU", population: 329200, rank: 14 },
  { name: "Belfast", countryCode: "GB", continentCode: "EU", population: 345418, rank: 15 },

  // Germany (15 cities - huge dance community)
  { name: "Berlin", countryCode: "DE", continentCode: "EU", population: 3769495, rank: 1 },
  { name: "Hamburg", countryCode: "DE", continentCode: "EU", population: 1899160, rank: 2 },
  { name: "Munich", countryCode: "DE", continentCode: "EU", population: 1484226, rank: 3 },
  { name: "Cologne", countryCode: "DE", continentCode: "EU", population: 1085664, rank: 4 },
  { name: "Frankfurt", countryCode: "DE", continentCode: "EU", population: 763380, rank: 5 },
  { name: "Stuttgart", countryCode: "DE", continentCode: "EU", population: 634830, rank: 6 },
  { name: "Düsseldorf", countryCode: "DE", continentCode: "EU", population: 619294, rank: 7 },
  { name: "Dortmund", countryCode: "DE", continentCode: "EU", population: 588250, rank: 8 },
  { name: "Essen", countryCode: "DE", continentCode: "EU", population: 582760, rank: 9 },
  { name: "Leipzig", countryCode: "DE", continentCode: "EU", population: 597493, rank: 10 },
  { name: "Bremen", countryCode: "DE", continentCode: "EU", population: 569352, rank: 11 },
  { name: "Dresden", countryCode: "DE", continentCode: "EU", population: 556780, rank: 12 },
  { name: "Hanover", countryCode: "DE", continentCode: "EU", population: 535061, rank: 13 },
  { name: "Nuremberg", countryCode: "DE", continentCode: "EU", population: 518365, rank: 14 },
  { name: "Duisburg", countryCode: "DE", continentCode: "EU", population: 498686, rank: 15 },

  // Italy (15 cities - huge dance community)
  { name: "Rome", countryCode: "IT", continentCode: "EU", population: 2872800, rank: 1 },
  { name: "Milan", countryCode: "IT", continentCode: "EU", population: 1378689, rank: 2 },
  { name: "Naples", countryCode: "IT", continentCode: "EU", population: 909048, rank: 3 },
  { name: "Turin", countryCode: "IT", continentCode: "EU", population: 848196, rank: 4 },
  { name: "Palermo", countryCode: "IT", continentCode: "EU", population: 657960, rank: 5 },
  { name: "Genoa", countryCode: "IT", continentCode: "EU", population: 578000, rank: 6 },
  { name: "Bologna", countryCode: "IT", continentCode: "EU", population: 390625, rank: 7 },
  { name: "Florence", countryCode: "IT", continentCode: "EU", population: 383083, rank: 8 },
  { name: "Bari", countryCode: "IT", continentCode: "EU", population: 306494, rank: 9 },
  { name: "Catania", countryCode: "IT", continentCode: "EU", population: 298957, rank: 10 },
  { name: "Venice", countryCode: "IT", continentCode: "EU", population: 258685, rank: 11 },
  { name: "Verona", countryCode: "IT", continentCode: "EU", population: 257353, rank: 12 },
  { name: "Messina", countryCode: "IT", continentCode: "EU", population: 234293, rank: 13 },
  { name: "Padua", countryCode: "IT", continentCode: "EU", population: 214125, rank: 14 },
  { name: "Trieste", countryCode: "IT", continentCode: "EU", population: 204234, rank: 15 },

  // Brazil (12 cities - large dance community)
  { name: "São Paulo", countryCode: "BR", continentCode: "SA", population: 12396372, rank: 1 },
  { name: "Rio de Janeiro", countryCode: "BR", continentCode: "SA", population: 6775561, rank: 2 },
  { name: "Brasília", countryCode: "BR", continentCode: "SA", population: 3094325, rank: 3 },
  { name: "Salvador", countryCode: "BR", continentCode: "SA", population: 2886698, rank: 4 },
  { name: "Fortaleza", countryCode: "BR", continentCode: "SA", population: 2703391, rank: 5 },
  { name: "Belo Horizonte", countryCode: "BR", continentCode: "SA", population: 2530701, rank: 6 },
  { name: "Manaus", countryCode: "BR", continentCode: "SA", population: 2255903, rank: 7 },
  { name: "Curitiba", countryCode: "BR", continentCode: "SA", population: 1963726, rank: 8 },
  { name: "Recife", countryCode: "BR", continentCode: "SA", population: 1661017, rank: 9 },
  { name: "Porto Alegre", countryCode: "BR", continentCode: "SA", population: 1492530, rank: 10 },
  { name: "Goiânia", countryCode: "BR", continentCode: "SA", population: 1555626, rank: 11 },
  { name: "Belém", countryCode: "BR", continentCode: "SA", population: 1506420, rank: 12 },

  // Argentina (10 cities - large dance community)
  { name: "Buenos Aires", countryCode: "AR", continentCode: "SA", population: 3075646, rank: 1 },
  { name: "Córdoba", countryCode: "AR", continentCode: "SA", population: 1565112, rank: 2 },
  { name: "Rosario", countryCode: "AR", continentCode: "SA", population: 1273815, rank: 3 },
  { name: "Mendoza", countryCode: "AR", continentCode: "SA", population: 115041, rank: 4 },
  { name: "San Miguel de Tucumán", countryCode: "AR", continentCode: "SA", population: 548866, rank: 5 },
  { name: "La Plata", countryCode: "AR", continentCode: "SA", population: 654324, rank: 6 },
  { name: "Mar del Plata", countryCode: "AR", continentCode: "SA", population: 593337, rank: 7 },
  { name: "Salta", countryCode: "AR", continentCode: "SA", population: 535303, rank: 8 },
  { name: "Santa Fe", countryCode: "AR", continentCode: "SA", population: 524325, rank: 9 },
  { name: "San Juan", countryCode: "AR", continentCode: "SA", population: 471389, rank: 10 },

  // Japan (12 cities - large dance community)
  { name: "Tokyo", countryCode: "JP", continentCode: "AS", population: 13929286, rank: 1 },
  { name: "Yokohama", countryCode: "JP", continentCode: "AS", population: 3726167, rank: 2 },
  { name: "Osaka", countryCode: "JP", continentCode: "AS", population: 2691185, rank: 3 },
  { name: "Nagoya", countryCode: "JP", continentCode: "AS", population: 2295638, rank: 4 },
  { name: "Sapporo", countryCode: "JP", continentCode: "AS", population: 1961690, rank: 5 },
  { name: "Fukuoka", countryCode: "JP", continentCode: "AS", population: 1607680, rank: 6 },
  { name: "Kobe", countryCode: "JP", continentCode: "AS", population: 1521648, rank: 7 },
  { name: "Kawasaki", countryCode: "JP", continentCode: "AS", population: 1536770, rank: 8 },
  { name: "Kyoto", countryCode: "JP", continentCode: "AS", population: 1464890, rank: 9 },
  { name: "Saitama", countryCode: "JP", continentCode: "AS", population: 1324479, rank: 10 },
  { name: "Hiroshima", countryCode: "JP", continentCode: "AS", population: 1194031, rank: 11 },
  { name: "Sendai", countryCode: "JP", continentCode: "AS", population: 1082009, rank: 12 },

  // China (10 cities - large dance community)
  { name: "Shanghai", countryCode: "CN", continentCode: "AS", population: 24870895, rank: 1 },
  { name: "Beijing", countryCode: "CN", continentCode: "AS", population: 21542000, rank: 2 },
  { name: "Guangzhou", countryCode: "CN", continentCode: "AS", population: 18676605, rank: 3 },
  { name: "Shenzhen", countryCode: "CN", continentCode: "AS", population: 17561455, rank: 4 },
  { name: "Tianjin", countryCode: "CN", continentCode: "AS", population: 13866009, rank: 5 },
  { name: "Wuhan", countryCode: "CN", continentCode: "AS", population: 12326318, rank: 6 },
  { name: "Dongguan", countryCode: "CN", continentCode: "AS", population: 10466625, rank: 7 },
  { name: "Chengdu", countryCode: "CN", continentCode: "AS", population: 20937757, rank: 8 },
  { name: "Nanjing", countryCode: "CN", continentCode: "AS", population: 9314687, rank: 9 },
  { name: "Hangzhou", countryCode: "CN", continentCode: "AS", population: 9188000, rank: 10 },

  // Indonesia (8 cities - medium dance community, including Bali)
  { name: "Jakarta", countryCode: "ID", continentCode: "AS", population: 10560000, rank: 1 },
  { name: "Surabaya", countryCode: "ID", continentCode: "AS", population: 2964439, rank: 2 },
  { name: "Bekasi", countryCode: "ID", continentCode: "AS", population: 2381053, rank: 3 },
  { name: "Bandung", countryCode: "ID", continentCode: "AS", population: 2382529, rank: 4 },
  { name: "Medan", countryCode: "ID", continentCode: "AS", population: 2173401, rank: 5 },
  { name: "Tangerang", countryCode: "ID", continentCode: "AS", population: 1798601, rank: 6 },
  { name: "Depok", countryCode: "ID", continentCode: "AS", population: 1738570, rank: 7 },
  { name: "Bali", countryCode: "ID", continentCode: "AS", population: 4434739, rank: 8 },

  // India (10 cities - large dance community)
  { name: "Mumbai", countryCode: "IN", continentCode: "AS", population: 12478447, rank: 1 },
  { name: "Delhi", countryCode: "IN", continentCode: "AS", population: 32941000, rank: 2 },
  { name: "Bangalore", countryCode: "IN", continentCode: "AS", population: 8436675, rank: 3 },
  { name: "Hyderabad", countryCode: "IN", continentCode: "AS", population: 6809970, rank: 4 },
  { name: "Ahmedabad", countryCode: "IN", continentCode: "AS", population: 5570585, rank: 5 },
  { name: "Chennai", countryCode: "IN", continentCode: "AS", population: 7090000, rank: 6 },
  { name: "Kolkata", countryCode: "IN", continentCode: "AS", population: 4496694, rank: 7 },
  { name: "Surat", countryCode: "IN", continentCode: "AS", population: 4460826, rank: 8 },
  { name: "Pune", countryCode: "IN", continentCode: "AS", population: 3726784, rank: 9 },
  { name: "Jaipur", countryCode: "IN", continentCode: "AS", population: 3073350, rank: 10 },

  // Thailand (5 cities - smaller dance community)
  { name: "Bangkok", countryCode: "TH", continentCode: "AS", population: 8305218, rank: 1 },
  { name: "Chiang Mai", countryCode: "TH", continentCode: "AS", population: 127240, rank: 2 },
  { name: "Pattaya", countryCode: "TH", continentCode: "AS", population: 119532, rank: 3 },
  { name: "Phuket", countryCode: "TH", continentCode: "AS", population: 79735, rank: 4 },
  { name: "Hat Yai", countryCode: "TH", continentCode: "AS", population: 159130, rank: 5 },

  // Vietnam (5 cities - smaller dance community)
  { name: "Ho Chi Minh City", countryCode: "VN", continentCode: "AS", population: 8993082, rank: 1 },
  { name: "Hanoi", countryCode: "VN", continentCode: "AS", population: 8053663, rank: 2 },
  { name: "Da Nang", countryCode: "VN", continentCode: "AS", population: 1134310, rank: 3 },
  { name: "Hai Phong", countryCode: "VN", continentCode: "AS", population: 2028560, rank: 4 },
  { name: "Can Tho", countryCode: "VN", continentCode: "AS", population: 1237000, rank: 5 },

  // Netherlands (8 cities - medium dance community)
  { name: "Amsterdam", countryCode: "NL", continentCode: "EU", population: 873338, rank: 1 },
  { name: "Rotterdam", countryCode: "NL", continentCode: "EU", population: 651446, rank: 2 },
  { name: "The Hague", countryCode: "NL", continentCode: "EU", population: 548320, rank: 3 },
  { name: "Utrecht", countryCode: "NL", continentCode: "EU", population: 361924, rank: 4 },
  { name: "Eindhoven", countryCode: "NL", continentCode: "EU", population: 243730, rank: 5 },
  { name: "Tilburg", countryCode: "NL", continentCode: "EU", population: 222601, rank: 6 },
  { name: "Groningen", countryCode: "NL", continentCode: "EU", population: 233218, rank: 7 },
  { name: "Almere", countryCode: "NL", continentCode: "EU", population: 217674, rank: 8 },

  // Canada (8 cities - medium dance community)
  { name: "Toronto", countryCode: "CA", continentCode: "NA", population: 2930000, rank: 1 },
  { name: "Montreal", countryCode: "CA", continentCode: "NA", population: 1780000, rank: 2 },
  { name: "Vancouver", countryCode: "CA", continentCode: "NA", population: 675218, rank: 3 },
  { name: "Calgary", countryCode: "CA", continentCode: "NA", population: 1306784, rank: 4 },
  { name: "Edmonton", countryCode: "CA", continentCode: "NA", population: 1010899, rank: 5 },
  { name: "Ottawa", countryCode: "CA", continentCode: "NA", population: 1017449, rank: 6 },
  { name: "Winnipeg", countryCode: "CA", continentCode: "NA", population: 749607, rank: 7 },
  { name: "Quebec City", countryCode: "CA", continentCode: "NA", population: 549459, rank: 8 },

  // Australia (8 cities - medium dance community)
  { name: "Sydney", countryCode: "AU", continentCode: "OC", population: 5312163, rank: 1 },
  { name: "Melbourne", countryCode: "AU", continentCode: "OC", population: 5078193, rank: 2 },
  { name: "Brisbane", countryCode: "AU", continentCode: "OC", population: 2487096, rank: 3 },
  { name: "Perth", countryCode: "AU", continentCode: "OC", population: 2085939, rank: 4 },
  { name: "Adelaide", countryCode: "AU", continentCode: "OC", population: 1359182, rank: 5 },
  { name: "Gold Coast", countryCode: "AU", continentCode: "OC", population: 709000, rank: 6 },
  { name: "Newcastle", countryCode: "AU", continentCode: "OC", population: 322278, rank: 7 },
  { name: "Canberra", countryCode: "AU", continentCode: "OC", population: 431380, rank: 8 },

  // South Africa (6 cities - medium dance community)
  { name: "Johannesburg", countryCode: "ZA", continentCode: "AF", population: 957441, rank: 1 },
  { name: "Cape Town", countryCode: "ZA", continentCode: "AF", population: 4618000, rank: 2 },
  { name: "Durban", countryCode: "ZA", continentCode: "AF", population: 595061, rank: 3 },
  { name: "Pretoria", countryCode: "ZA", continentCode: "AF", population: 741651, rank: 4 },
  { name: "Port Elizabeth", countryCode: "ZA", continentCode: "AF", population: 312392, rank: 5 },
  { name: "Bloemfontein", countryCode: "ZA", continentCode: "AF", population: 256185, rank: 6 },

  // Singapore (1 city - small country)
  { name: "Singapore", countryCode: "SG", continentCode: "AS", population: 5453566, rank: 1 },

  // Hong Kong (1 city - small region)
  { name: "Hong Kong", countryCode: "HK", continentCode: "AS", population: 7500700, rank: 1 },

  // South Korea (8 cities - medium dance community)
  { name: "Seoul", countryCode: "KR", continentCode: "AS", population: 9720846, rank: 1 },
  { name: "Busan", countryCode: "KR", continentCode: "AS", population: 3448737, rank: 2 },
  { name: "Incheon", countryCode: "KR", continentCode: "AS", population: 2950545, rank: 3 },
  { name: "Daegu", countryCode: "KR", continentCode: "AS", population: 2423844, rank: 4 },
  { name: "Daejeon", countryCode: "KR", continentCode: "AS", population: 1475222, rank: 5 },
  { name: "Gwangju", countryCode: "KR", continentCode: "AS", population: 1441970, rank: 6 },
  { name: "Suwon", countryCode: "KR", continentCode: "AS", population: 1234300, rank: 7 },
  { name: "Ulsan", countryCode: "KR", continentCode: "AS", population: 1166033, rank: 8 },

  // Taiwan (6 cities - medium dance community)
  { name: "Taipei", countryCode: "TW", continentCode: "AS", population: 2704974, rank: 1 },
  { name: "Kaohsiung", countryCode: "TW", continentCode: "AS", population: 2778918, rank: 2 },
  { name: "Taichung", countryCode: "TW", continentCode: "AS", population: 2814559, rank: 3 },
  { name: "Tainan", countryCode: "TW", continentCode: "AS", population: 1874915, rank: 4 },
  { name: "Hsinchu", countryCode: "TW", continentCode: "AS", population: 463625, rank: 5 },
  { name: "Taoyuan", countryCode: "TW", continentCode: "AS", population: 2249149, rank: 6 },

  // Mexico (10 cities - medium dance community)
  { name: "Mexico City", countryCode: "MX", continentCode: "NA", population: 9209944, rank: 1 },
  { name: "Guadalajara", countryCode: "MX", continentCode: "NA", population: 1500800, rank: 2 },
  { name: "Monterrey", countryCode: "MX", continentCode: "NA", population: 1135512, rank: 3 },
  { name: "Puebla", countryCode: "MX", continentCode: "NA", population: 1695872, rank: 4 },
  { name: "Tijuana", countryCode: "MX", continentCode: "NA", population: 1810645, rank: 5 },
  { name: "León", countryCode: "MX", continentCode: "NA", population: 1579803, rank: 6 },
  { name: "Juárez", countryCode: "MX", continentCode: "NA", population: 1501551, rank: 7 },
  { name: "Zapopan", countryCode: "MX", continentCode: "NA", population: 1247000, rank: 8 },
  { name: "Nezahualcóyotl", countryCode: "MX", continentCode: "NA", population: 1104585, rank: 9 },
  { name: "Chihuahua", countryCode: "MX", continentCode: "NA", population: 925762, rank: 10 },

  // Colombia (8 cities - medium dance community)
  { name: "Bogotá", countryCode: "CO", continentCode: "SA", population: 7743955, rank: 1 },
  { name: "Medellín", countryCode: "CO", continentCode: "SA", population: 2529403, rank: 2 },
  { name: "Cali", countryCode: "CO", continentCode: "SA", population: 2471472, rank: 3 },
  { name: "Barranquilla", countryCode: "CO", continentCode: "SA", population: 1274250, rank: 4 },
  { name: "Cartagena", countryCode: "CO", continentCode: "SA", population: 914552, rank: 5 },
  { name: "Bucaramanga", countryCode: "CO", continentCode: "SA", population: 581130, rank: 6 },
  { name: "Cúcuta", countryCode: "CO", continentCode: "SA", population: 668987, rank: 7 },
  { name: "Pereira", countryCode: "CO", continentCode: "SA", population: 467166, rank: 8 },

  // Israel (3 cities - small dance community)
  { name: "Tel Aviv", countryCode: "IL", continentCode: "AS", population: 460613, rank: 1 },
  { name: "Jerusalem", countryCode: "IL", continentCode: "AS", population: 936425, rank: 2 },
  { name: "Haifa", countryCode: "IL", continentCode: "AS", population: 285316, rank: 3 },

  // United Arab Emirates (3 cities - small dance community)
  { name: "Dubai", countryCode: "AE", continentCode: "AS", population: 3331420, rank: 1 },
  { name: "Abu Dhabi", countryCode: "AE", continentCode: "AS", population: 1450000, rank: 2 },
  { name: "Sharjah", countryCode: "AE", continentCode: "AS", population: 1865000, rank: 3 },

  // Philippines (6 cities - medium dance community)
  { name: "Manila", countryCode: "PH", continentCode: "AS", population: 1348442, rank: 1 },
  { name: "Cebu City", countryCode: "PH", continentCode: "AS", population: 922611, rank: 2 },
  { name: "Davao City", countryCode: "PH", continentCode: "AS", population: 1773088, rank: 3 },
  { name: "Quezon City", countryCode: "PH", continentCode: "AS", population: 2960048, rank: 4 },
  { name: "Makati", countryCode: "PH", continentCode: "AS", population: 629616, rank: 5 },
  { name: "Taguig", countryCode: "PH", continentCode: "AS", population: 886722, rank: 6 },

  // Malaysia (6 cities - medium dance community)
  { name: "Kuala Lumpur", countryCode: "MY", continentCode: "AS", population: 1588750, rank: 1 },
  { name: "George Town", countryCode: "MY", continentCode: "AS", population: 708127, rank: 2 },
  { name: "Ipoh", countryCode: "MY", continentCode: "AS", population: 737861, rank: 3 },
  { name: "Petaling Jaya", countryCode: "MY", continentCode: "AS", population: 638516, rank: 4 },
  { name: "Shah Alam", countryCode: "MY", continentCode: "AS", population: 584340, rank: 5 },
  { name: "Klang", countryCode: "MY", continentCode: "AS", population: 878000, rank: 6 },

  // Laos (2 cities - small dance community)
  { name: "Vientiane", countryCode: "LA", continentCode: "AS", population: 948487, rank: 1 },
  { name: "Luang Prabang", countryCode: "LA", continentCode: "AS", population: 70000, rank: 2 },

  // Sweden (6 cities - medium dance community)
  { name: "Stockholm", countryCode: "SE", continentCode: "EU", population: 975551, rank: 1 },
  { name: "Gothenburg", countryCode: "SE", continentCode: "EU", population: 579281, rank: 2 },
  { name: "Malmö", countryCode: "SE", continentCode: "EU", population: 347949, rank: 3 },
  { name: "Uppsala", countryCode: "SE", continentCode: "EU", population: 230767, rank: 4 },
  { name: "Västerås", countryCode: "SE", continentCode: "EU", population: 150564, rank: 5 },
  { name: "Örebro", countryCode: "SE", continentCode: "EU", population: 156381, rank: 6 },

  // Norway (5 cities - medium dance community)
  { name: "Oslo", countryCode: "NO", continentCode: "EU", population: 697010, rank: 1 },
  { name: "Bergen", countryCode: "NO", continentCode: "EU", population: 286930, rank: 2 },
  { name: "Trondheim", countryCode: "NO", continentCode: "EU", population: 205332, rank: 3 },
  { name: "Stavanger", countryCode: "NO", continentCode: "EU", population: 144699, rank: 4 },
  { name: "Kristiansand", countryCode: "NO", continentCode: "EU", population: 112310, rank: 5 },

  // Poland (8 cities - medium dance community)
  { name: "Warsaw", countryCode: "PL", continentCode: "EU", population: 1790658, rank: 1 },
  { name: "Kraków", countryCode: "PL", continentCode: "EU", population: 779115, rank: 2 },
  { name: "Łódź", countryCode: "PL", continentCode: "EU", population: 677286, rank: 3 },
  { name: "Wrocław", countryCode: "PL", continentCode: "EU", population: 643782, rank: 4 },
  { name: "Poznań", countryCode: "PL", continentCode: "EU", population: 534813, rank: 5 },
  { name: "Gdańsk", countryCode: "PL", continentCode: "EU", population: 470907, rank: 6 },
  { name: "Szczecin", countryCode: "PL", continentCode: "EU", population: 400990, rank: 7 },
  { name: "Bydgoszcz", countryCode: "PL", continentCode: "EU", population: 346739, rank: 8 },

  // Russia (10 cities - large dance community)
  { name: "Moscow", countryCode: "RU", continentCode: "EU", population: 12615079, rank: 1 },
  { name: "Saint Petersburg", countryCode: "RU", continentCode: "EU", population: 5383890, rank: 2 },
  { name: "Novosibirsk", countryCode: "RU", continentCode: "EU", population: 1625631, rank: 3 },
  { name: "Yekaterinburg", countryCode: "RU", continentCode: "EU", population: 1495126, rank: 4 },
  { name: "Kazan", countryCode: "RU", continentCode: "EU", population: 1257391, rank: 5 },
  { name: "Nizhny Novgorod", countryCode: "RU", continentCode: "EU", population: 1252236, rank: 6 },
  { name: "Chelyabinsk", countryCode: "RU", continentCode: "EU", population: 1202371, rank: 7 },
  { name: "Samara", countryCode: "RU", continentCode: "EU", population: 1156659, rank: 8 },
  { name: "Omsk", countryCode: "RU", continentCode: "EU", population: 1172251, rank: 9 },
  { name: "Rostov-on-Don", countryCode: "RU", continentCode: "EU", population: 1125299, rank: 10 },

  // Austria (5 cities - medium dance community)
  { name: "Vienna", countryCode: "AT", continentCode: "EU", population: 1973403, rank: 1 },
  { name: "Graz", countryCode: "AT", continentCode: "EU", population: 291072, rank: 2 },
  { name: "Linz", countryCode: "AT", continentCode: "EU", population: 207247, rank: 3 },
  { name: "Salzburg", countryCode: "AT", continentCode: "EU", population: 155331, rank: 4 },
  { name: "Innsbruck", countryCode: "AT", continentCode: "EU", population: 132493, rank: 5 },

  // Belgium (5 cities - medium dance community)
  { name: "Brussels", countryCode: "BE", continentCode: "EU", population: 1218255, rank: 1 },
  { name: "Antwerp", countryCode: "BE", continentCode: "EU", population: 529247, rank: 2 },
  { name: "Ghent", countryCode: "BE", continentCode: "EU", population: 263927, rank: 3 },
  { name: "Charleroi", countryCode: "BE", continentCode: "EU", population: 201816, rank: 4 },
  { name: "Liège", countryCode: "BE", continentCode: "EU", population: 197355, rank: 5 },

  // Switzerland (5 cities - medium dance community)
  { name: "Zurich", countryCode: "CH", continentCode: "EU", population: 421878, rank: 1 },
  { name: "Geneva", countryCode: "CH", continentCode: "EU", population: 203951, rank: 2 },
  { name: "Basel", countryCode: "CH", continentCode: "EU", population: 178120, rank: 3 },
  { name: "Bern", countryCode: "CH", continentCode: "EU", population: 134591, rank: 4 },
  { name: "Lausanne", countryCode: "CH", continentCode: "EU", population: 140202, rank: 5 },

  // Denmark (4 cities - medium dance community)
  { name: "Copenhagen", countryCode: "DK", continentCode: "EU", population: 644431, rank: 1 },
  { name: "Aarhus", countryCode: "DK", continentCode: "EU", population: 285273, rank: 2 },
  { name: "Odense", countryCode: "DK", continentCode: "EU", population: 180863, rank: 3 },
  { name: "Aalborg", countryCode: "DK", continentCode: "EU", population: 121540, rank: 4 },

  // Finland (4 cities - medium dance community)
  { name: "Helsinki", countryCode: "FI", continentCode: "EU", population: 656229, rank: 1 },
  { name: "Espoo", countryCode: "FI", continentCode: "EU", population: 297481, rank: 2 },
  { name: "Tampere", countryCode: "FI", continentCode: "EU", population: 244671, rank: 3 },
  { name: "Vantaa", countryCode: "FI", continentCode: "EU", population: 239216, rank: 4 },

  // Portugal (6 cities - medium dance community)
  { name: "Lisbon", countryCode: "PT", continentCode: "EU", population: 547733, rank: 1 },
  { name: "Porto", countryCode: "PT", continentCode: "EU", population: 237591, rank: 2 },
  { name: "Vila Nova de Gaia", countryCode: "PT", continentCode: "EU", population: 302295, rank: 3 },
  { name: "Amadora", countryCode: "PT", continentCode: "EU", population: 175136, rank: 4 },
  { name: "Braga", countryCode: "PT", continentCode: "EU", population: 193333, rank: 5 },
  { name: "Funchal", countryCode: "PT", continentCode: "EU", population: 111892, rank: 6 },

  // Greece (6 cities - medium dance community)
  { name: "Athens", countryCode: "GR", continentCode: "EU", population: 664046, rank: 1 },
  { name: "Thessaloniki", countryCode: "GR", continentCode: "EU", population: 325182, rank: 2 },
  { name: "Patras", countryCode: "GR", continentCode: "EU", population: 213984, rank: 3 },
  { name: "Piraeus", countryCode: "GR", continentCode: "EU", population: 163688, rank: 4 },
  { name: "Larissa", countryCode: "GR", continentCode: "EU", population: 144651, rank: 5 },
  { name: "Heraklion", countryCode: "GR", continentCode: "EU", population: 173993, rank: 6 },

  // Czech Republic (5 cities - medium dance community)
  { name: "Prague", countryCode: "CZ", continentCode: "EU", population: 1335084, rank: 1 },
  { name: "Brno", countryCode: "CZ", continentCode: "EU", population: 382405, rank: 2 },
  { name: "Ostrava", countryCode: "CZ", continentCode: "EU", population: 284982, rank: 3 },
  { name: "Plzeň", countryCode: "CZ", continentCode: "EU", population: 175219, rank: 4 },
  { name: "Liberec", countryCode: "CZ", continentCode: "EU", population: 104261, rank: 5 },

  // Hungary (4 cities - medium dance community)
  { name: "Budapest", countryCode: "HU", continentCode: "EU", population: 1752286, rank: 1 },
  { name: "Debrecen", countryCode: "HU", continentCode: "EU", population: 201432, rank: 2 },
  { name: "Szeged", countryCode: "HU", continentCode: "EU", population: 160258, rank: 3 },
  { name: "Miskolc", countryCode: "HU", continentCode: "EU", population: 152901, rank: 4 },

  // Romania (6 cities - medium dance community)
  { name: "Bucharest", countryCode: "RO", continentCode: "EU", population: 1883425, rank: 1 },
  { name: "Cluj-Napoca", countryCode: "RO", continentCode: "EU", population: 324576, rank: 2 },
  { name: "Timișoara", countryCode: "RO", continentCode: "EU", population: 319279, rank: 3 },
  { name: "Iași", countryCode: "RO", continentCode: "EU", population: 290422, rank: 4 },
  { name: "Constanța", countryCode: "RO", continentCode: "EU", population: 283872, rank: 5 },
  { name: "Craiova", countryCode: "RO", continentCode: "EU", population: 269506, rank: 6 },

  // Bulgaria (4 cities - medium dance community)
  { name: "Sofia", countryCode: "BG", continentCode: "EU", population: 1286393, rank: 1 },
  { name: "Plovdiv", countryCode: "BG", continentCode: "EU", population: 346893, rank: 2 },
  { name: "Varna", countryCode: "BG", continentCode: "EU", population: 335177, rank: 3 },
  { name: "Burgas", countryCode: "BG", continentCode: "EU", population: 202966, rank: 4 },

  // Croatia (4 cities - medium dance community)
  { name: "Zagreb", countryCode: "HR", continentCode: "EU", population: 806341, rank: 1 },
  { name: "Split", countryCode: "HR", continentCode: "EU", population: 178102, rank: 2 },
  { name: "Rijeka", countryCode: "HR", continentCode: "EU", population: 128624, rank: 3 },
  { name: "Osijek", countryCode: "HR", continentCode: "EU", population: 108048, rank: 4 },

  // Slovenia (3 cities - small dance community)
  { name: "Ljubljana", countryCode: "SI", continentCode: "EU", population: 295504, rank: 1 },
  { name: "Maribor", countryCode: "SI", continentCode: "EU", population: 112065, rank: 2 },
  { name: "Celje", countryCode: "SI", continentCode: "EU", population: 37820, rank: 3 },

  // Slovakia (4 cities - medium dance community)
  { name: "Bratislava", countryCode: "SK", continentCode: "EU", population: 475503, rank: 1 },
  { name: "Košice", countryCode: "SK", continentCode: "EU", population: 229040, rank: 2 },
  { name: "Prešov", countryCode: "SK", continentCode: "EU", population: 88680, rank: 3 },
  { name: "Žilina", countryCode: "SK", continentCode: "EU", population: 80827, rank: 4 },

  // Lithuania (3 cities - small dance community)
  { name: "Vilnius", countryCode: "LT", continentCode: "EU", population: 588412, rank: 1 },
  { name: "Kaunas", countryCode: "LT", continentCode: "EU", population: 315993, rank: 2 },
  { name: "Klaipėda", countryCode: "LT", continentCode: "EU", population: 152008, rank: 3 },

  // Latvia (2 cities - small dance community)
  { name: "Riga", countryCode: "LV", continentCode: "EU", population: 605802, rank: 1 },
  { name: "Daugavpils", countryCode: "LV", continentCode: "EU", population: 82046, rank: 2 },

  // Estonia (2 cities - small dance community)
  { name: "Tallinn", countryCode: "EE", continentCode: "EU", population: 437619, rank: 1 },
  { name: "Tartu", countryCode: "EE", continentCode: "EU", population: 91407, rank: 2 },

  // Ireland (4 cities - medium dance community)
  { name: "Dublin", countryCode: "IE", continentCode: "EU", population: 592713, rank: 1 },
  { name: "Cork", countryCode: "IE", continentCode: "EU", population: 210000, rank: 2 },
  { name: "Limerick", countryCode: "IE", continentCode: "EU", population: 194899, rank: 3 },
  { name: "Galway", countryCode: "IE", continentCode: "EU", population: 79934, rank: 4 },

  // Iceland (2 cities - small dance community)
  { name: "Reykjavik", countryCode: "IS", continentCode: "EU", population: 131136, rank: 1 },
  { name: "Kópavogur", countryCode: "IS", continentCode: "EU", population: 37549, rank: 2 },

  // Luxembourg (1 city - small country)
  { name: "Luxembourg City", countryCode: "LU", continentCode: "EU", population: 128514, rank: 1 },

  // Malta (1 city - small country)
  { name: "Valletta", countryCode: "MT", continentCode: "EU", population: 5748, rank: 1 },

  // Cyprus (2 cities - small dance community)
  { name: "Nicosia", countryCode: "CY", continentCode: "EU", population: 330000, rank: 1 },
  { name: "Limassol", countryCode: "CY", continentCode: "EU", population: 235056, rank: 2 },

  // Albania (3 cities - small dance community)
  { name: "Tirana", countryCode: "AL", continentCode: "EU", population: 418495, rank: 1 },
  { name: "Durrës", countryCode: "AL", continentCode: "EU", population: 201110, rank: 2 },
  { name: "Vlorë", countryCode: "AL", continentCode: "EU", population: 130827, rank: 3 },

  // Serbia (4 cities - medium dance community)
  { name: "Belgrade", countryCode: "RS", continentCode: "EU", population: 1687132, rank: 1 },
  { name: "Novi Sad", countryCode: "RS", continentCode: "EU", population: 341625, rank: 2 },
  { name: "Niš", countryCode: "RS", continentCode: "EU", population: 260237, rank: 3 },
  { name: "Kragujevac", countryCode: "RS", continentCode: "EU", population: 150835, rank: 4 },

  // Montenegro (2 cities - small dance community)
  { name: "Podgorica", countryCode: "ME", continentCode: "EU", population: 150977, rank: 1 },
  { name: "Nikšić", countryCode: "ME", continentCode: "EU", population: 56970, rank: 2 },

  // North Macedonia (2 cities - small dance community)
  { name: "Skopje", countryCode: "MK", continentCode: "EU", population: 544086, rank: 1 },
  { name: "Bitola", countryCode: "MK", continentCode: "EU", population: 74550, rank: 2 },

  // Bosnia and Herzegovina (3 cities - small dance community)
  { name: "Sarajevo", countryCode: "BA", continentCode: "EU", population: 275524, rank: 1 },
  { name: "Banja Luka", countryCode: "BA", continentCode: "EU", population: 185042, rank: 2 },
  { name: "Tuzla", countryCode: "BA", continentCode: "EU", population: 110979, rank: 3 },

  // Ukraine (6 cities - medium dance community)
  { name: "Kyiv", countryCode: "UA", continentCode: "EU", population: 2967360, rank: 1 },
  { name: "Kharkiv", countryCode: "UA", continentCode: "EU", population: 1441057, rank: 2 },
  { name: "Odesa", countryCode: "UA", continentCode: "EU", population: 1017699, rank: 3 },
  { name: "Dnipro", countryCode: "UA", continentCode: "EU", population: 980948, rank: 4 },
  { name: "Donetsk", countryCode: "UA", continentCode: "EU", population: 905364, rank: 5 },
  { name: "Zaporizhzhia", countryCode: "UA", continentCode: "EU", population: 722713, rank: 6 },

  // Belarus (3 cities - small dance community)
  { name: "Minsk", countryCode: "BY", continentCode: "EU", population: 2009786, rank: 1 },
  { name: "Gomel", countryCode: "BY", continentCode: "EU", population: 508839, rank: 2 },
  { name: "Mogilev", countryCode: "BY", continentCode: "EU", population: 357100, rank: 3 },

  // Moldova (2 cities - small dance community)
  { name: "Chișinău", countryCode: "MD", continentCode: "EU", population: 532513, rank: 1 },
  { name: "Tiraspol", countryCode: "MD", continentCode: "EU", population: 133807, rank: 2 },

  // Turkey (8 cities - medium dance community)
  { name: "Istanbul", countryCode: "TR", continentCode: "EU", population: 15519267, rank: 1 },
  { name: "Ankara", countryCode: "TR", continentCode: "EU", population: 5663322, rank: 2 },
  { name: "İzmir", countryCode: "TR", continentCode: "EU", population: 4367251, rank: 3 },
  { name: "Bursa", countryCode: "TR", continentCode: "EU", population: 3056127, rank: 4 },
  { name: "Antalya", countryCode: "TR", continentCode: "EU", population: 2518103, rank: 5 },
  { name: "Adana", countryCode: "TR", continentCode: "EU", population: 2220125, rank: 6 },
  { name: "Konya", countryCode: "TR", continentCode: "EU", population: 2232374, rank: 7 },
  { name: "Gaziantep", countryCode: "TR", continentCode: "EU", population: 2133314, rank: 8 },

  // Costa Rica (3 cities - small dance community)
  { name: "San José", countryCode: "CR", continentCode: "NA", population: 342188, rank: 1 },
  { name: "Cartago", countryCode: "CR", continentCode: "NA", population: 156600, rank: 2 },
  { name: "Alajuela", countryCode: "CR", continentCode: "NA", population: 254886, rank: 3 },

  // Panama (3 cities - small dance community)
  { name: "Panama City", countryCode: "PA", continentCode: "NA", population: 880691, rank: 1 },
  { name: "San Miguelito", countryCode: "PA", continentCode: "NA", population: 315019, rank: 2 },
  { name: "Tocumen", countryCode: "PA", continentCode: "NA", population: 100000, rank: 3 },

  // Dominican Republic (4 cities - medium dance community)
  { name: "Santo Domingo", countryCode: "DO", continentCode: "NA", population: 2201941, rank: 1 },
  { name: "Santiago", countryCode: "DO", continentCode: "NA", population: 1342943, rank: 2 },
  { name: "La Romana", countryCode: "DO", continentCode: "NA", population: 130426, rank: 3 },
  { name: "San Pedro de Macorís", countryCode: "DO", continentCode: "NA", population: 195037, rank: 4 },

  // Puerto Rico (3 cities - small dance community)
  { name: "San Juan", countryCode: "PR", continentCode: "NA", population: 342259, rank: 1 },
  { name: "Bayamón", countryCode: "PR", continentCode: "NA", population: 185187, rank: 2 },
  { name: "Carolina", countryCode: "PR", continentCode: "NA", population: 154815, rank: 3 },

  // Trinidad and Tobago (2 cities - small dance community)
  { name: "Port of Spain", countryCode: "TT", continentCode: "NA", population: 370074, rank: 1 },
  { name: "San Fernando", countryCode: "TT", continentCode: "NA", population: 82000, rank: 2 },

  // Barbados (1 city - small country)
  { name: "Bridgetown", countryCode: "BB", continentCode: "NA", population: 110000, rank: 1 },

  // Chile (6 cities - medium dance community)
  { name: "Santiago", countryCode: "CL", continentCode: "SA", population: 7048080, rank: 1 },
  { name: "Valparaíso", countryCode: "CL", continentCode: "SA", population: 296655, rank: 2 },
  { name: "Concepción", countryCode: "CL", continentCode: "SA", population: 971285, rank: 3 },
  { name: "La Serena", countryCode: "CL", continentCode: "SA", population: 221054, rank: 4 },
  { name: "Antofagasta", countryCode: "CL", continentCode: "SA", population: 380695, rank: 5 },
  { name: "Temuco", countryCode: "CL", continentCode: "SA", population: 282415, rank: 6 },

  // Peru (6 cities - medium dance community)
  { name: "Lima", countryCode: "PE", continentCode: "SA", population: 10750000, rank: 1 },
  { name: "Arequipa", countryCode: "PE", continentCode: "SA", population: 1008290, rank: 2 },
  { name: "Trujillo", countryCode: "PE", continentCode: "SA", population: 919899, rank: 3 },
  { name: "Chiclayo", countryCode: "PE", continentCode: "SA", population: 600440, rank: 4 },
  { name: "Piura", countryCode: "PE", continentCode: "SA", population: 484475, rank: 5 },
  { name: "Iquitos", countryCode: "PE", continentCode: "SA", population: 471993, rank: 6 },

  // Venezuela (5 cities - medium dance community)
  { name: "Caracas", countryCode: "VE", continentCode: "SA", population: 1943901, rank: 1 },
  { name: "Maracaibo", countryCode: "VE", continentCode: "SA", population: 1551539, rank: 2 },
  { name: "Valencia", countryCode: "VE", continentCode: "SA", population: 894204, rank: 3 },
  { name: "Barquisimeto", countryCode: "VE", continentCode: "SA", population: 1059092, rank: 4 },
  { name: "Maracay", countryCode: "VE", continentCode: "SA", population: 955362, rank: 5 },

  // Ecuador (4 cities - medium dance community)
  { name: "Quito", countryCode: "EC", continentCode: "SA", population: 2011388, rank: 1 },
  { name: "Guayaquil", countryCode: "EC", continentCode: "SA", population: 2708752, rank: 2 },
  { name: "Cuenca", countryCode: "EC", continentCode: "SA", population: 636996, rank: 3 },
  { name: "Santo Domingo", countryCode: "EC", continentCode: "SA", population: 458580, rank: 4 },

  // Bolivia (4 cities - medium dance community)
  { name: "La Paz", countryCode: "BO", continentCode: "SA", population: 789585, rank: 1 },
  { name: "Santa Cruz", countryCode: "BO", continentCode: "SA", population: 315176, rank: 2 },
  { name: "Cochabamba", countryCode: "BO", continentCode: "SA", population: 630587, rank: 3 },
  { name: "Sucre", countryCode: "BO", continentCode: "SA", population: 300000, rank: 4 },

  // Paraguay (3 cities - small dance community)
  { name: "Asunción", countryCode: "PY", continentCode: "SA", population: 525252, rank: 1 },
  { name: "Ciudad del Este", countryCode: "PY", continentCode: "SA", population: 308983, rank: 2 },
  { name: "San Lorenzo", countryCode: "PY", continentCode: "SA", population: 252561, rank: 3 },

  // Uruguay (3 cities - small dance community)
  { name: "Montevideo", countryCode: "UY", continentCode: "SA", population: 1305182, rank: 1 },
  { name: "Salto", countryCode: "UY", continentCode: "SA", population: 104028, rank: 2 },
  { name: "Paysandú", countryCode: "UY", continentCode: "SA", population: 76329, rank: 3 },

  // Nigeria (6 cities - medium dance community)
  { name: "Lagos", countryCode: "NG", continentCode: "AF", population: 15388000, rank: 1 },
  { name: "Kano", countryCode: "NG", continentCode: "AF", population: 2828861, rank: 2 },
  { name: "Ibadan", countryCode: "NG", continentCode: "AF", population: 3160000, rank: 3 },
  { name: "Abuja", countryCode: "NG", continentCode: "AF", population: 356412, rank: 4 },
  { name: "Port Harcourt", countryCode: "NG", continentCode: "AF", population: 1865000, rank: 5 },
  { name: "Benin City", countryCode: "NG", continentCode: "AF", population: 1495000, rank: 6 },

  // Egypt (5 cities - medium dance community)
  { name: "Cairo", countryCode: "EG", continentCode: "AF", population: 20484965, rank: 1 },
  { name: "Alexandria", countryCode: "EG", continentCode: "AF", population: 5150000, rank: 2 },
  { name: "Giza", countryCode: "EG", continentCode: "AF", population: 3240000, rank: 3 },
  { name: "Shubra El Kheima", countryCode: "EG", continentCode: "AF", population: 1020000, rank: 4 },
  { name: "Port Said", countryCode: "EG", continentCode: "AF", population: 749371, rank: 5 },

  // Morocco (4 cities - medium dance community)
  { name: "Casablanca", countryCode: "MA", continentCode: "AF", population: 3359818, rank: 1 },
  { name: "Rabat", countryCode: "MA", continentCode: "AF", population: 577827, rank: 2 },
  { name: "Fes", countryCode: "MA", continentCode: "AF", population: 1112072, rank: 3 },
  { name: "Marrakech", countryCode: "MA", continentCode: "AF", population: 928850, rank: 4 },

  // Tunisia (3 cities - small dance community)
  { name: "Tunis", countryCode: "TN", continentCode: "AF", population: 1056247, rank: 1 },
  { name: "Sfax", countryCode: "TN", continentCode: "AF", population: 955421, rank: 2 },
  { name: "Sousse", countryCode: "TN", continentCode: "AF", population: 221530, rank: 3 },

  // New Zealand (4 cities - medium dance community)
  { name: "Auckland", countryCode: "NZ", continentCode: "OC", population: 1657000, rank: 1 },
  { name: "Wellington", countryCode: "NZ", continentCode: "OC", population: 212700, rank: 2 },
  { name: "Christchurch", countryCode: "NZ", continentCode: "OC", population: 396700, rank: 3 },
  { name: "Hamilton", countryCode: "NZ", continentCode: "OC", population: 176500, rank: 4 },
];

async function seedGeographicData() {
  try {
    await connectMongo();
    console.log("Connected to MongoDB");

    // Clear existing data
    await Continent.deleteMany({});
    await Country.deleteMany({});
    await City.deleteMany({});
    console.log("Cleared existing data");

    // Seed continents
    const createdContinents = await Continent.insertMany(continents);
    console.log(`Created ${createdContinents.length} continents`);

    // Create continent lookup map
    const continentMap = new Map();
    createdContinents.forEach(continent => {
      continentMap.set(continent.code, continent._id);
    });

    // Seed countries with continent references
    const countriesWithContinent = countries.map(country => ({
      ...country,
      continent: continentMap.get(country.continentCode),
    }));

    const createdCountries = await Country.insertMany(countriesWithContinent);
    console.log(`Created ${createdCountries.length} countries`);

    // Create country lookup map
    const countryMap = new Map();
    createdCountries.forEach(country => {
      countryMap.set(country.code, country._id);
    });

    // Seed cities with country and continent references
    const citiesWithReferences = cities.map(city => ({
      name: city.name,
      country: countryMap.get(city.countryCode),
      continent: continentMap.get(city.continentCode),
      population: city.population,
      rank: city.rank,
      isActive: true,
    }));

    const createdCities = await City.insertMany(citiesWithReferences);
    console.log(`Created ${createdCities.length} cities`);

    console.log("Geographic data seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding geographic data:", error);
    process.exit(1);
  }
}

seedGeographicData();
