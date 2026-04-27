import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Calendar, Users, Pencil, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getProfile, getAllUsers, updateUserRole } from '../services/user.service';

// Format a date string to a readable format
const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

// Badge color based on role
const roleBadgeColor = {
  ADMIN: 'bg-purple-100 text-purple-700',
  USER: 'bg-blue-100 text-blue-700',
  READ_ONLY: 'bg-gray-100 text-gray-600',
};

function ProfilePage() {
  const { user: authUser } = useAuth(); // user from context (basic info)

  // Full profile from API (includes createdAt etc.)
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Admin-only: list of all users
  const [allUsers, setAllUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Role update feedback
  const [roleSuccess, setRoleSuccess] = useState('');
  const [roleError, setRoleError] = useState('');

  const isAdmin = authUser?.role === 'ADMIN';

  // --- Fetch the logged-in user's profile on mount ---
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setProfile(data.user);
      } catch (err) {
        console.error('Failed to fetch profile', err);
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, []);

  // --- If Admin: fetch all users ---
  useEffect(() => {
    if (!isAdmin) return;
    const fetchAllUsers = async () => {
      setLoadingUsers(true);
      try {
        const data = await getAllUsers();
        setAllUsers(data.users || []);
      } catch (err) {
        console.error('Failed to fetch users', err);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchAllUsers();
  }, [isAdmin]);

  // --- Handle role change for a user ---
  const handleRoleChange = async (userId, newRole) => {
    setRoleSuccess('');
    setRoleError('');
    try {
      await updateUserRole(userId, newRole);
      // Update the local list without re-fetching
      setAllUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      setRoleSuccess('Role updated successfully!');
      setTimeout(() => setRoleSuccess(''), 3000); // clear after 3s
    } catch (err) {
      setRoleError('Failed to update role. Please try again.');
      setTimeout(() => setRoleError(''), 3000);
    }
  };

  if (loadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400 text-lg">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Page Header */}
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex items-center space-x-5">
          {/* Avatar circle with initials */}
          <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {(profile?.name || profile?.email || '?')[0].toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{profile?.name || 'No name set'}</h2>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${roleBadgeColor[profile?.role]}`}>
              {profile?.role}
            </span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Email */}
          <div className="flex items-center space-x-3 bg-gray-50 rounded-xl p-4">
            <Mail className="h-5 w-5 text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-400 font-medium">Email Address</p>
              <p className="text-sm text-gray-800 font-semibold">{profile?.email}</p>
            </div>
          </div>

          {/* Role */}
          <div className="flex items-center space-x-3 bg-gray-50 rounded-xl p-4">
            <Shield className="h-5 w-5 text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-400 font-medium">Role</p>
              <p className="text-sm text-gray-800 font-semibold">{profile?.role}</p>
            </div>
          </div>

          {/* Name */}
          <div className="flex items-center space-x-3 bg-gray-50 rounded-xl p-4">
            <User className="h-5 w-5 text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-400 font-medium">Full Name</p>
              <p className="text-sm text-gray-800 font-semibold">{profile?.name || '—'}</p>
            </div>
          </div>

          {/* Member Since */}
          <div className="flex items-center space-x-3 bg-gray-50 rounded-xl p-4">
            <Calendar className="h-5 w-5 text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-400 font-medium">Member Since</p>
              <p className="text-sm text-gray-800 font-semibold">{formatDate(profile?.createdAt)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- ADMIN ONLY: User Management Section --- */}
      {isAdmin && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {/* Section header */}
          <div className="flex items-center space-x-2 mb-5">
            <Users className="h-5 w-5 text-purple-600" />
            <h2 className="text-lg font-bold text-gray-900">All Users</h2>
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">
              Admin Panel
            </span>
          </div>

          {/* Success / Error feedback */}
          {roleSuccess && (
            <div className="flex items-center space-x-2 bg-green-50 text-green-700 text-sm px-4 py-2 rounded-lg mb-4">
              <CheckCircle className="h-4 w-4" />
              <span>{roleSuccess}</span>
            </div>
          )}
          {roleError && (
            <div className="flex items-center space-x-2 bg-red-50 text-red-700 text-sm px-4 py-2 rounded-lg mb-4">
              <AlertCircle className="h-4 w-4" />
              <span>{roleError}</span>
            </div>
          )}

          {loadingUsers ? (
            <p className="text-gray-400 text-center py-8">Loading users...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-gray-500 font-semibold">Name</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-semibold">Email</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-semibold">Joined</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-semibold">Role</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-semibold">Change Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {allUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-800">{u.name || '—'}</td>
                      <td className="px-4 py-3 text-gray-500">{u.email}</td>
                      <td className="px-4 py-3 text-gray-500">{formatDate(u.createdAt)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${roleBadgeColor[u.role]}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {/* Dropdown to change user role — disabled for the admin themselves */}
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          disabled={u.id === profile?.id} // Can't change your own role
                          className="border border-gray-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <option value="ADMIN">ADMIN</option>
                          <option value="USER">USER</option>
                          <option value="READ_ONLY">READ_ONLY</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
