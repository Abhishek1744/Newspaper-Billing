import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { supabase } from '../lib/supabase';
import { Shield, Clock } from 'lucide-react';

interface AdminUser {
  id: string;
  email: string;
  role: string;
  last_sign_in: string;
}

interface LoginHistory {
  id: string;
  user_id: string;
  timestamp: string;
  email: string;
}

const Settings = () => {
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminUsers = async () => {
      try {
        const { data: users, error } = await supabase
          .from('admin_users')
          .select(`
            id,
            user_id,
            role,
            auth.users!inner(email, last_sign_in_at)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const formattedUsers = users.map(user => ({
          id: user.id,
          email: user.auth.users.email,
          role: user.role,
          last_sign_in: user.auth.users.last_sign_in_at
        }));

        setAdminUsers(formattedUsers);
      } catch (error) {
        console.error('Error fetching admin users:', error);
      }
    };

    const fetchLoginHistory = async () => {
      try {
        const { data: history, error } = await supabase
          .from('auth.sessions')
          .select('id, user_id, created_at, auth.users!inner(email)')
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;

        const formattedHistory = history.map(entry => ({
          id: entry.id,
          user_id: entry.user_id,
          timestamp: entry.created_at,
          email: entry.auth.users.email
        }));

        setLoginHistory(formattedHistory);
      } catch (error) {
        console.error('Error fetching login history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminUsers();
    fetchLoginHistory();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      {/* Admin Users */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <Shield className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Admin Users</h2>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Sign In
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {adminUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.email}
                    {currentUser?.email === user.email && (
                      <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        You
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(user.last_sign_in).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Login History */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <Clock className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Recent Login Activity</h2>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loginHistory.map((entry) => (
                <tr key={entry.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {entry.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(entry.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Settings;