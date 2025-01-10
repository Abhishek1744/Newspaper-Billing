import { supabase } from './supabase';

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: 'editor' // Default role for new admin users
      }
    }
  });
  
  if (error) throw error;
  
  // Create admin user record
  if (data.user) {
    const { error: adminError } = await supabase
      .from('admin_users')
      .insert([
        {
          user_id: data.user.id,
          role: 'editor'
        }
      ]);
    
    if (adminError) throw adminError;
  }
  
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  // Get admin user details
  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('*')
    .eq('user_id', user.id)
    .single();
  
  return {
    ...user,
    role: adminUser?.role || 'editor'
  };
}

export async function isAdmin() {
  const user = await getCurrentUser();
  return user?.role === 'admin';
}