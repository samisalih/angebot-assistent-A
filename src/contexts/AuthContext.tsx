
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }

        // Handle email confirmation
        if (event === 'SIGNED_IN' && session) {
          console.log('User signed in successfully');
          
          // Check if this is coming from email confirmation
          const urlParams = new URLSearchParams(window.location.search);
          const type = urlParams.get('type');
          const access_token = urlParams.get('access_token');
          
          if (type === 'signup' && access_token) {
            // This is an email confirmation, redirect to success page
            console.log('Email confirmation detected, redirecting to success page');
            window.location.href = '/auth-success';
          }
        }

        if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed successfully');
        }

        if (event === 'SIGNED_OUT') {
          console.log('User signed out');
        }
      }
    );

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        }
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting sign in for:', email);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Sign in error:', error);
      } else {
        console.log('Sign in successful');
      }
      
      return { error };
    } catch (error) {
      console.error('Unexpected error in signIn:', error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const redirectUrl = `${window.location.origin}/auth-success`;
      
      console.log('Attempting sign up for:', email, 'with redirect URL:', redirectUrl);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });
      
      if (error) {
        console.error('Sign up error:', error);
      } else {
        console.log('Sign up successful - check email for confirmation');
      }
      
      return { error };
    } catch (error) {
      console.error('Unexpected error in signUp:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out');
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!session?.user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
