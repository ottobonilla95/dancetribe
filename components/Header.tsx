"use client";

import { useState, useEffect } from "react";
import type { JSX } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import ButtonSignin from "./ButtonSignin";
import SearchBar from "./SearchBar";
import logo from "@/app/icon.png";
import config from "@/config";
import { useFriendRequestCount } from "@/libs/hooks";
import { FaUser, FaUserFriends, FaCog, FaSignOutAlt, FaHome } from "react-icons/fa";
import { signOut } from "next-auth/react";

const links: {
  href: string;
  label: string;
}[] = [
  // {
  //   href: "/#testimonials",
  //   label: "Reviews",
  // },
];

const cta: JSX.Element = <ButtonSignin extraStyle="btn-primary" />;

// A header with a logo on the left, links in the center (like Pricing, etc...), and a CTA (like Get Started or Login) on the right.
// The header is responsive, and on mobile, the links are hidden behind a burger button.
const Header = () => {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const pendingRequests = useFriendRequestCount();

  // setIsOpen(false) when the route changes (i.e: when the user clicks on a link on mobile)
  useEffect(() => {
    setIsOpen(false);
  }, [searchParams]);



  const loggedInNavItems = [
    { href: "/dashboard", label: "Dashboard", icon: FaHome },
    { href: "/profile", label: "My Profile", icon: FaUser },
    { 
      href: "/friends", 
      label: "Friends", 
      icon: FaUserFriends, 
      badge: pendingRequests > 0 ? pendingRequests : undefined 
    },
    { href: "/onboarding", label: "Settings", icon: FaCog },
  ];

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <header className="bg-base-200 text-neutral-content">
      <nav
        className="container flex items-center justify-between px-8 py-4 mx-auto"
        aria-label="Global"
      >
        {/* Your logo/name on large screens */}
        <div className="flex lg:flex-1">
          <Link
            className="flex items-center gap-2 shrink-0 "
            href="/"
            title={`${config.appName} homepage`}
          >
            <Image
              src={logo}
              alt={`${config.appName} logo`}
              className="w-8"
              placeholder="blur"
              priority={true}
              width={32}
              height={32}
            />
            <span className="font-extrabold text-lg">{config.appName}</span>
          </Link>
        </div>
        {/* Burger button to open menu on mobile */}
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 relative"
            onClick={() => setIsOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 text-base-content"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
            {/* Friend request notification badge */}
            {session && pendingRequests > 0 && (
              <span className="absolute -top-1 -right-1 bg-error text-error-content text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium animate-pulse">
                {pendingRequests > 9 ? '9+' : pendingRequests}
              </span>
            )}
          </button>
        </div>

        {/* Your links on large screens */}
        <div className="hidden lg:flex lg:justify-center lg:gap-12 lg:items-center">
          {links.map((link) => (
            <Link
              href={link.href}
              key={link.href}
              className="link link-hover"
              title={link.label}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Search Bar */}
        {session && (
          <div className="hidden lg:flex lg:justify-center lg:flex-1 lg:max-w-lg lg:mx-6">
            <SearchBar placeholder="Find dancers..." compact className="w-full" />
          </div>
        )}

        {/* CTA on large screens */}
        <div className="hidden lg:flex lg:justify-end lg:flex-1">
          {session ? (
            <div className="flex items-center gap-4">
              {/* Friend Requests Badge */}
              {pendingRequests > 0 && (
                <Link href="/friends" className="btn btn-ghost btn-sm gap-2">
                  <FaUserFriends />
                  <span className="badge badge-secondary badge-sm">{pendingRequests}</span>
                </Link>
              )}
              
              {/* User Avatar/Menu */}
              <div className="dropdown dropdown-end">
                <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                  <div className="w-8 rounded-full">
                    {session.user?.image ? (
                      <Image
                        src={session.user.image}
                        alt={session.user?.name || "Profile"}
                        width={32}
                        height={32}
                        className="rounded-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="bg-primary text-primary-content rounded-full w-full h-full flex items-center justify-center">
                        <span className="text-sm font-bold">
                          {session.user?.name?.charAt(0)?.toUpperCase() || "U"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
                  {loggedInNavItems.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className="flex items-center gap-2">
                        <item.icon />
                        {item.label}
                        {item.badge && (
                          <span className="badge badge-secondary badge-xs ml-auto">{item.badge}</span>
                        )}
                      </Link>
                    </li>
                  ))}
                  <li><hr /></li>
                  <li>
                    <button onClick={handleSignOut} className="flex items-center gap-2 text-error">
                      <FaSignOutAlt />
                      Sign Out
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            cta
          )}
        </div>
      </nav>

      {/* Mobile menu, show/hide based on menu state. */}
      <div className={`relative z-50 ${isOpen ? "" : "hidden"}`}>
        <div
          className={`fixed inset-y-0 right-0 z-10 w-full px-8 py-4 overflow-y-auto bg-base-200 sm:max-w-sm sm:ring-1 sm:ring-neutral/10 transform origin-right transition ease-in-out duration-300`}
        >
          {/* Your logo/name on small screens */}
          <div className="flex items-center justify-between">
            <Link
              className="flex items-center gap-2 shrink-0 "
              title={`${config.appName} homepage`}
              href="/"
            >
              <Image
                src={logo}
                alt={`${config.appName} logo`}
                className="w-8"
                placeholder="blur"
                priority={true}
                width={32}
                height={32}
              />
              <span className="font-extrabold text-lg">{config.appName}</span>
            </Link>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5"
              onClick={() => setIsOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Your links on small screens */}
          <div className="flow-root mt-6">
            {session ? (
              /* Logged-in user menu */
              <>
                {/* User Info */}
                <div className="flex items-center gap-3 pb-4 border-b border-base-300">
                  <div className="avatar">
                    <div className="w-12 h-12 rounded-full">
                      {session.user?.image ? (
                        <Image
                          src={session.user.image}
                          alt={session.user?.name || "Profile"}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover rounded-full"
                          unoptimized
                        />
                      ) : (
                        <div className="bg-primary text-primary-content rounded-full w-full h-full flex items-center justify-center">
                          <span className="text-lg font-bold">
                            {session.user?.name?.charAt(0)?.toUpperCase() || "U"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{session.user?.name || "User"}</h3>
                    <p className="text-sm text-base-content/60 truncate">{session.user?.email}</p>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="py-4 border-b border-base-300">
                  <SearchBar placeholder="Find dancers..." />
                </div>

                {/* Navigation Items */}
                <div className="py-4">
                  <div className="flex flex-col gap-y-3">
                    {loggedInNavItems.map((item) => (
                      <Link
                        href={item.href}
                        key={item.href}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-base-300 transition-colors"
                        title={item.label}
                      >
                        <item.icon className="text-lg" />
                        <span className="font-medium">{item.label}</span>
                        {item.badge && (
                          <span className="ml-auto badge badge-secondary badge-sm">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="divider"></div>
                
                {/* Sign Out */}
                <div className="py-2">
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg w-full text-left hover:bg-error hover:text-error-content transition-colors"
                  >
                    <FaSignOutAlt className="text-lg" />
                    <span className="font-medium">Sign Out</span>
                  </button>
                </div>
              </>
            ) : (
              /* Non-logged-in user menu */
              <>
                <div className="py-4">
                  <div className="flex flex-col gap-y-4 items-start">
                    {links.map((link) => (
                      <Link
                        href={link.href}
                        key={link.href}
                        className="link link-hover"
                        title={link.label}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="divider"></div>
                {/* Your CTA on small screens */}
                <div className="flex flex-col">{cta}</div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
