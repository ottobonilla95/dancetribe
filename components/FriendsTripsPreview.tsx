"use client";

import Link from "next/link";
import { FaPlane, FaCalendar, FaMapMarkerAlt } from "react-icons/fa";
import { useTranslation } from "./I18nProvider";

interface FriendTrip {
  _id: string;
  city: {
    _id: string;
    name: string;
    image?: string;
    country: {
      name: string;
      code: string;
    };
  };
  startDate: Date;
  endDate: Date;
  friend: {
    _id: string;
    name: string;
    username: string;
    image?: string;
  };
}

interface FriendsTripsPreviewProps {
  trips: FriendTrip[];
}

export default function FriendsTripsPreview({ trips = [] }: FriendsTripsPreviewProps) {
  const { t } = useTranslation();

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formatDistanceToNow = (date: Date) => {
    const now = new Date();
    const diff = new Date(date).getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days < 0) return "started";
    if (days === 0) return "today";
    if (days === 1) return "in 1 day";
    if (days < 7) return `in ${days} days`;
    if (days < 30) {
      const weeks = Math.floor(days / 7);
      return `in ${weeks} ${weeks === 1 ? "week" : "weeks"}`;
    }
    const months = Math.floor(days / 30);
    return `in ${months} ${months === 1 ? "month" : "months"}`;
  };

  return (
    <div className="card bg-base-200 shadow-xl">
      <div className="card-body">
        <div className="flex items-center justify-between mb-4">
          <h2 className="card-title">
            <FaPlane className="text-primary" />
            {t('dashboard.friendsTrips')}
          </h2>
          <Link href="/friends/trips" className="btn btn-ghost btn-sm">
            {t('common.viewAll')}
          </Link>
        </div>

        <div className="space-y-3">
          {trips.map((trip) => (
            <Link
              key={trip._id}
              href={`/city/${trip.city._id}`}
              className="block hover:bg-base-300 rounded-lg p-3 transition-colors"
            >
              <div className="flex items-start gap-3">
                {/* Friend Avatar */}
                <Link
                  href={`/dancer/${trip.friend._id}`}
                  className="avatar"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="w-10 h-10 rounded-full">
                    {trip.friend.image ? (
                      <img
                        src={trip.friend.image}
                        alt={trip.friend.name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <div className="bg-primary text-primary-content rounded-full w-full h-full flex items-center justify-center">
                        <span className="text-sm">
                          {trip.friend.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>

                {/* Trip Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm truncate">
                      {trip.friend.name}
                    </span>
                    <FaPlane className="text-xs text-primary" />
                    <span className="font-semibold text-sm truncate">
                      {trip.city.name}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-xs text-base-content/60">
                    <span className="flex items-center gap-1">
                      <FaCalendar className="text-[10px]" />
                      {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaMapMarkerAlt className="text-[10px]" />
                      {trip.city.country.name}
                    </span>
                  </div>

                  <p className="text-xs text-primary mt-1">
                    {formatDistanceToNow(new Date(trip.startDate))}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {trips.length > 0 && (
          <Link
            href="/friends/trips"
            className="btn btn-outline btn-sm btn-block mt-4"
          >
            {t('common.viewAll')}
          </Link>
        )}
      </div>
    </div>
  );
}

