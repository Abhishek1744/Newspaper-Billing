import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Calendar, DollarSign, Users, FileText } from 'lucide-react';
import { RootState } from '../store/store';
import { fetchInvoices } from '../store/slices/invoiceSlice';
import { fetchCustomers } from '../store/slices/customerSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { invoices } = useSelector((state: RootState) => state.invoices);
  const { customers, requests } = useSelector((state: RootState) => state.customers);

  useEffect(() => {
    dispatch(fetchInvoices() as any);
    dispatch(fetchCustomers() as any);
  }, [dispatch]);

  const totalRevenue = invoices.reduce((sum, inv) => sum + Number(inv.amount), 0);
  const pendingInvoices = invoices.filter(inv => inv.status === 'pending').length;
  const activeCustomers = customers.filter(c => c.status === 'active').length;
  const pendingRequests = requests.filter(r => r.status === 'pending').length;

  const upcomingDues = invoices
    .filter(inv => inv.status === 'pending')
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Invoices</p>
              <p className="text-2xl font-bold">{pendingInvoices}</p>
            </div>
            <FileText className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Customers</p>
              <p className="text-2xl font-bold">{activeCustomers}</p>
            </div>
            <Users className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">New Requests</p>
              <p className="text-2xl font-bold">{pendingRequests}</p>
            </div>
            <Calendar className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>
      
      {/* Upcoming Dues */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Dues</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {upcomingDues.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invoice.customers.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{invoice.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(invoice.due_date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;