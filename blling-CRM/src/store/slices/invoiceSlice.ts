import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../../lib/supabase';
import { jsPDF } from 'jspdf';

export interface Invoice {
  id: string;
  customer_id: string;
  amount: number;
  due_date: string;
  status: string;
  created_at: string;
}

interface InvoiceState {
  invoices: Invoice[];
  loading: boolean;
  error: string | null;
}

const initialState: InvoiceState = {
  invoices: [],
  loading: false,
  error: null,
};

export const fetchInvoices = createAsyncThunk(
  'invoices/fetchInvoices',
  async () => {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        customers (
          name,
          email,
          phone
        )
      `)
      .order('due_date', { ascending: false });
    
    if (error) throw error;
    return data;
  }
);

export const createInvoice = createAsyncThunk(
  'invoices/createInvoice',
  async (invoice: Partial<Invoice>) => {
    const { data, error } = await supabase
      .from('invoices')
      .insert([invoice])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
);

export const generatePDF = createAsyncThunk(
  'invoices/generatePDF',
  async (invoice: any) => {
    const doc = new jsPDF();
    
    // Add company header
    doc.setFontSize(20);
    doc.text('AbhishekNews', 20, 20);
    
    // Add invoice details
    doc.setFontSize(12);
    doc.text(`Invoice #: ${invoice.id}`, 20, 40);
    doc.text(`Date: ${new Date(invoice.created_at).toLocaleDateString()}`, 20, 50);
    doc.text(`Due Date: ${new Date(invoice.due_date).toLocaleDateString()}`, 20, 60);
    
    // Add customer details
    doc.text('Bill To:', 20, 80);
    doc.text(invoice.customers.name, 20, 90);
    doc.text(invoice.customers.email, 20, 100);
    doc.text(invoice.customers.phone, 20, 110);
    
    // Add amount
    doc.text(`Amount Due: ₹${invoice.amount}`, 20, 130);
    
    // Save the PDF
    doc.save(`invoice-${invoice.id}.pdf`);
  }
);

const invoiceSlice = createSlice({
  name: 'invoices',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvoices.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices = action.payload;
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || null;
      });
  },
});

export default invoiceSlice.reducer;