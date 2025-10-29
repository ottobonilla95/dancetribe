import { FaUsers } from "react-icons/fa";

export default function UsersPage() {
  return (
    <div className="max-w-5xl">
      <div className="flex items-center gap-3 mb-8">
        <FaUsers className="text-primary text-3xl" />
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-base-content/60 mt-2">
            Coming soon - Manage users, view profiles, and moderate content
          </p>
        </div>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body items-center text-center py-16">
          <FaUsers className="text-6xl text-base-content/20 mb-4" />
          <h2 className="card-title text-2xl mb-2">User Management</h2>
          <p className="text-base-content/60 max-w-md">
            This feature is coming soon. You&apos;ll be able to search users, 
            view detailed profiles, and perform admin actions.
          </p>
        </div>
      </div>
    </div>
  );
}

