export type SearchUser = {
  _id: string;
  name: string;
  username: string;
  image?: string;
  city?: {
    name: string;
  } | null;
};

export type SearchCity = {
  _id: string;
  name: string;
  country: {
    name: string;
    code: string;
  } | null;
  image?: string;
  totalDancers: number;
};

export type SearchCountry = {
  _id: string;
  name: string;
  code: string;
};

export type UnifiedSearchResponse = {
  users: SearchUser[];
  cities: SearchCity[];
  countries: SearchCountry[];
  totalResults: number;
  message?: string;
};

export type SearchParams = {
  query: string;
  limit?: number;
  page?: number;
};
