import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../../lib/supabase';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: string;
  created_at: string;
}

interface CustomerState {
  customers: Customer[];
  requests: any[];
  loading: boolean;
  error: string | null;
}

const initialState: CustomerState = {
  customers: [],
  requests: [],
  loading: false,
  error: null,
};

export const fetchCustomers = createAsyncThunk(
  'customers/fetchCustomers',
  async () => {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }
);

export const fetchRequests = createAsyncThunk(
  'customers/fetchRequests',
  async () => {
    const { data, error } = await supabase
      .from('subscription_requests')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }
);

export const approveRequest = createAsyncThunk(
  'customers/approveRequest',
  async (requestId: string) => {
    const { data: request } = await supabase
      .from('subscription_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (!request) throw new Error('Request not found');

    // Create new customer
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .insert([{
        name: request.name,
        email: request.email,
        phone: request.phone,
        address: request.address,
        status: 'active'
      }])
      .select()
      .single();

    if (customerError) throw customerError;

    // Update request status
    const { error: updateError } = await supabase
      .from('subscription_requests')
      .update({ status: 'approved' })
      .eq('id', requestId);

    if (updateError) throw updateError;

    return { request, customer };
  }
);

const customerSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = action.payload;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || null;
      })
      .addCase(fetchRequests.fulfilled, (state, action) => {
        state.requests = action.payload;
      });
  },
});

export default customerSlice.reducer;