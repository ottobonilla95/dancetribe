"use client";

import Link from "next/link";
import { FaPlane, FaCalendar, FaMapMarkerAlt, FaUsers } from "react-icons/fa";
import { useTranslation } from "./I18nProvider";

interface TripOverlap {
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
  friend: {
    _id: string;
    name: string;
    username: string;
    image?: string;
  };
  yourTrip: {
    startDate: Date;
    endDate: Date;
  };
  friendTrip: {
    startDate: Date;
    endDate: Date;
  };
  overlap: {
    startDate: Date;
    endDate: Date;
    days: number;
  };
}

interface TripOverlapsProps {
  overlaps: TripOverlap[];
}

export default function TripOverlaps({ overlaps = [] }: TripOverlapsProps) {
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

    if (days < 0) return "happening now";
    if (days === 0) return "today";
    if (days === 1) return "tomorrow";
    if (days < 7) return `in ${days} days`;
    if (days < 30) {
      const weeks = Math.floor(days / 7);
      return `in ${weeks} ${weeks === 1 ? "week" : "weeks"}`;
    }
    const months = Math.floor(days / 30);
    return `in ${months} ${months === 1 ? "month" : "months"}`;
  };

  if (overlaps.length === 0) {
    return null; // Don't show anything if no overlaps
  }

  return (
    <section className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <span className="text-3xl">🎉</span>
            {t('trips.meetUpOpportunities') || 'Meetup Opportunities!'}
          </h2>
          <p className="text-base-content/60 text-sm mt-1">
            {t('trips.youAndFriendsSamePlace') || 'You and your friends will be in the same city!'}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {overlaps.map((overlap) => (
          <div
            key={overlap._id}
            className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border-2 border-primary/30 rounded-lg hover:shadow-lg transition-all duration-300"
          >
            <div className="p-3 sm:p-4">
              <div className="flex gap-3">
                {/* Friend Avatar */}
                <Link
                  href={`/dancer/${overlap.friend._id}`}
                  className="avatar flex-shrink-0"
                >
                  {overlap.friend.image ? (
                    <div className="w-12 h-12 rounded-full ring-2 ring-primary ring-offset-base-100 ring-offset-1">
                      <img src={overlap.friend.image} alt={overlap.friend.name} />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary text-primary-content flex items-center justify-center text-lg font-bold ring-2 ring-primary ring-offset-base-100 ring-offset-1">
                      {overlap.friend.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </Link>

                {/* Overlap Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap text-sm">
                    <span className="font-medium">{t('trips.youAnd') || 'You and'}</span>
                    <Link
                      href={`/dancer/${overlap.friend._id}`}
                      className="font-semibold text-primary hover:underline"
                    >
                      {overlap.friend.name}
                    </Link>
                    <FaPlane className="text-primary text-xs" />
                    <Link
                      href={`/city/${overlap.city._id}`}
                      className="font-semibold hover:underline"
                    >
                      {overlap.city.name}
                    </Link>
                  </div>

                  {/* Overlap Details */}
                  <div className="flex items-center gap-2 text-xs text-base-content/70 mb-1">
                    <div className="flex items-center gap-1">
                      <FaCalendar className="text-[10px]" />
                      <span>
                        {formatDate(overlap.overlap.startDate)} - {formatDate(overlap.overlap.endDate)}
                      </span>
                    </div>
                    <span className="badge badge-primary badge-xs">
                      {overlap.overlap.days} {overlap.overlap.days === 1 ? (t('common.day') || 'day') : (t('common.days') || 'days')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-base-content/60">
                    <FaMapMarkerAlt className="text-[10px]" />
                    <span>{overlap.city.country.name}</span>
                    <span>•</span>
                    <span className="text-primary">
                      {formatDistanceToNow(new Date(overlap.overlap.startDate))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

