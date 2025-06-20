
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { CheckCircle, Loader, AlertCircle } from 'lucide-react';

const AuthSuccess = () => {
  const { user, loading } = useAuth();
  const [confirming, setConfirming] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Check URL parameters for confirmation status
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    const errorDescription = urlParams.get('error_description');

    if (error) {
      console.error('Auth error:', error, errorDescription);
      setHasError(true);
      setConfirming(false);
      return;
    }

    // Give some time for the auth state to update
    const timer = setTimeout(() => {
      setConfirming(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Close the tab after successful confirmation and user is authenticated
    if (user && !loading && !confirming && !hasError) {
      const closeTimer = setTimeout(() => {
        window.close();
      }, 2000);

      return () => clearTimeout(closeTimer);
    }
  }, [user, loading, confirming, hasError]);

  if (hasError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <AlertCircle className="h-16 w-16 text-red-500" />
            <h1 className="text-2xl font-bold text-red-700">
              Bestätigung fehlgeschlagen
            </h1>
            <div className="space-y-2 text-muted-foreground">
              <p>Der Bestätigungslink ist ungültig oder abgelaufen.</p>
              <p>Bitte versuchen Sie es erneut oder registrieren Sie sich noch einmal.</p>
            </div>
            <button 
              onClick={() => window.close()}
              className="mt-4 text-sm text-blue-600 hover:text-blue-800"
            >
              Tab schließen
            </button>
          </div>
        </Card>
      </div>
    );
  }

  if (loading || confirming) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <Loader className="h-12 w-12 animate-spin text-primary" />
            <h1 className="text-2xl font-bold">E-Mail wird bestätigt...</h1>
            <p className="text-muted-foreground">
              Bitte warten Sie einen Moment, während wir Ihr Konto aktivieren.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="flex flex-col items-center space-y-4">
          <CheckCircle className="h-16 w-16 text-green-500" />
          <h1 className="text-2xl font-bold text-green-700">
            Registrierung erfolgreich!
          </h1>
          <div className="space-y-2 text-muted-foreground">
            <p>Ihr Konto wurde erfolgreich aktiviert.</p>
            <p>Sie sind jetzt angemeldet und können diese Registerkarte schließen.</p>
            {user && (
              <p className="text-sm bg-muted p-2 rounded">
                Angemeldet als: {user.email}
              </p>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Diese Registerkarte schließt sich automatisch in wenigen Sekunden.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default AuthSuccess;
