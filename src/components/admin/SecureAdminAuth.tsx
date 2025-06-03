
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, UserPlus, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { supabase } from "@/integrations/supabase/client";

interface SecureAdminAuthProps {
  onAuthenticated: () => void;
}

export const SecureAdminAuth = ({ onAuthenticated }: SecureAdminAuthProps) => {
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const { isAdmin, isAdminLoading, user } = useAdminAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (isAdmin && !isAdminLoading) {
      onAuthenticated();
    }
  }, [isAdmin, isAdminLoading, onAuthenticated]);

  const handleCreateFirstAdmin = async () => {
    if (!user) {
      toast({
        title: "Fehler",
        description: "Sie müssen angemeldet sein, um einen Admin-Benutzer zu erstellen.",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingAdmin(true);
    try {
      const { error } = await supabase
        .from('admin_users')
        .insert({
          user_id: user.id,
          role: 'admin',
          created_by: user.id,
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Admin-Benutzer erstellt",
        description: "Sie wurden erfolgreich als Administrator registriert.",
      });

      // Trigger re-check of admin status
      window.location.reload();
    } catch (error) {
      console.error('Error creating admin user:', error);
      toast({
        title: "Fehler",
        description: "Admin-Benutzer konnte nicht erstellt werden.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  const checkExistingAdmins = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('id')
        .eq('is_active', true)
        .limit(1);

      return !error && data && data.length > 0;
    } catch (error) {
      console.error('Error checking for existing admins:', error);
      return true; // Assume admins exist to be safe
    }
  };

  const [hasExistingAdmins, setHasExistingAdmins] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAdmins = async () => {
      const exists = await checkExistingAdmins();
      setHasExistingAdmins(exists);
    };
    checkAdmins();
  }, []);

  if (isAdminLoading || hasExistingAdmins === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">Überprüfe Administrator-Berechtigung...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <CardTitle>Administrator-Zugang</CardTitle>
            <CardDescription>
              Sie müssen angemeldet sein, um auf den Administrator-Bereich zuzugreifen.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setShowAuthDialog(true)} 
              className="w-full"
            >
              Anmelden
            </Button>
          </CardContent>
        </Card>

        <AuthDialog
          open={showAuthDialog}
          onOpenChange={setShowAuthDialog}
          onSuccess={() => setShowAuthDialog(false)}
        />
      </div>
    );
  }

  if (!hasExistingAdmins && user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-4">
              <UserPlus className="h-6 w-6 text-white" />
            </div>
            <CardTitle>Erster Administrator</CardTitle>
            <CardDescription>
              Es wurden noch keine Administrator-Benutzer erstellt. Erstellen Sie den ersten Admin-Account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-orange-600 mr-2 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-orange-700">
                    <p className="font-medium">Wichtiger Sicherheitshinweis:</p>
                    <p>Sie sind als <strong>{user.email}</strong> angemeldet. Dieser Account wird zum ersten Administrator.</p>
                  </div>
                </div>
              </div>
              <Button 
                onClick={handleCreateFirstAdmin}
                disabled={isCreatingAdmin}
                className="w-full"
              >
                {isCreatingAdmin ? "Erstelle Administrator..." : "Ersten Administrator erstellen"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <CardTitle>Zugriff verweigert</CardTitle>
          <CardDescription>
            Sie sind als <strong>{user.email}</strong> angemeldet, haben aber keine Administrator-Berechtigung.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center">
            Wenden Sie sich an einen bestehenden Administrator, um Zugriff zu erhalten.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
