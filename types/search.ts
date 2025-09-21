export type SearchUser = {
  _id: string;
  name: string;
  username: string;
  image?: string;
  city?: {
    name: string;
    country: string;
    continent: string;
  } | null;
  danceStyles: {
    name: string;
    level: string;
  }[];
  gender?: string;
  nationality?: string;
};

export type SearchResponse = {
  users: SearchUser[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
  message?: string;
};

export type SearchParams = {
  query: string;
  limit?: number;
  page?: number;
};
