// Helper function to get country code from country name for flag display
export const getCountryCode = (countryName: string): string => {
  const countryMap: { [key: string]: string } = {
    "United States": "us", "United Kingdom": "gb", "Canada": "ca", "Australia": "au",
    "Germany": "de", "France": "fr", "Italy": "it", "Spain": "es", "Japan": "jp",
    "China": "cn", "Hong Kong": "hk", "India": "in", "Brazil": "br", "Mexico": "mx", "Russia": "ru",
    "South Korea": "kr", "Netherlands": "nl", "Sweden": "se", "Norway": "no",
    "Denmark": "dk", "Finland": "fi", "Poland": "pl", "Turkey": "tr",
    "South Africa": "za", "Argentina": "ar", "Chile": "cl", "Colombia": "co",
    "Peru": "pe", "Venezuela": "ve", "Ecuador": "ec", "Bolivia": "bo",
    "Uruguay": "uy", "Paraguay": "py", "Ireland": "ie", "Portugal": "pt",
    "Greece": "gr", "Austria": "at", "Switzerland": "ch", "Belgium": "be",
    "Czech Republic": "cz", "Hungary": "hu", "Romania": "ro", "Bulgaria": "bg",
    "Croatia": "hr", "Serbia": "rs", "Slovenia": "si", "Slovakia": "sk",
    "Estonia": "ee", "Latvia": "lv", "Lithuania": "lt", "Ukraine": "ua",
    "Israel": "il", "Egypt": "eg", "Morocco": "ma", "Algeria": "dz",
    "Tunisia": "tn", "Libya": "ly", "Nigeria": "ng", "Kenya": "ke",
    "Ghana": "gh", "Ethiopia": "et", "Tanzania": "tz", "Uganda": "ug",
    "Rwanda": "rw", "Senegal": "sn", "Mali": "ml", "Burkina Faso": "bf",
    "Niger": "ne", "Chad": "td", "Sudan": "sd", "Somalia": "so",
    "Madagascar": "mg", "Mauritius": "mu", "Seychelles": "sc",
    "Singapore": "sg", "Malaysia": "my", "Thailand": "th", "Vietnam": "vn",
    "Philippines": "ph", "Indonesia": "id", "Myanmar": "mm", "Cambodia": "kh",
    "Laos": "la", "Bangladesh": "bd", "Pakistan": "pk", "Afghanistan": "af",
    "Iran": "ir", "Iraq": "iq", "Syria": "sy", "Lebanon": "lb",
    "Jordan": "jo", "Saudi Arabia": "sa", "United Arab Emirates": "ae",
    "Qatar": "qa", "Kuwait": "kw", "Bahrain": "bh", "Oman": "om",
    "Yemen": "ye", "New Zealand": "nz", "Fiji": "fj", "Papua New Guinea": "pg",
    "Albania": "al", "Armenia": "am", "Azerbaijan": "az", "Belarus": "by",
    "Bosnia and Herzegovina": "ba", "Georgia": "ge", "Kazakhstan": "kz",
    "Kyrgyzstan": "kg", "Moldova": "md", "Montenegro": "me", "North Macedonia": "mk",
    "Tajikistan": "tj", "Turkmenistan": "tm", "Uzbekistan": "uz"
  };
  
  return countryMap[countryName] || countryName.toLowerCase().replace(/\s+/g, '').slice(0, 2);
}; 