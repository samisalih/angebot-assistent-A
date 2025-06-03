
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AdminUser {
  id: string;
  user_id: string;
  role: string;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
}

export const useAdminAuth = () => {
  const { user, isAuthenticated } = useAuth();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isAdminLoading, setIsAdminLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!isAuthenticated || !user) {
        setAdminUser(null);
        setIsAdmin(false);
        setIsAdminLoading(false);
        return;
      }

      try {
        // Check if user is an admin
        const { data, error } = await supabase
          .from('admin_users')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
          setAdminUser(null);
        } else if (data) {
          setIsAdmin(true);
          setAdminUser(data);
          
          // Update last login time
          await supabase.rpc('update_admin_last_login');
        } else {
          setIsAdmin(false);
          setAdminUser(null);
        }
      } catch (error) {
        console.error('Error in admin auth check:', error);
        setIsAdmin(false);
        setAdminUser(null);
      } finally {
        setIsAdminLoading(false);
      }
    };

    checkAdminStatus();
  }, [user, isAuthenticated]);

  return {
    isAdmin,
    adminUser,
    isAdminLoading,
    user
  };
};
