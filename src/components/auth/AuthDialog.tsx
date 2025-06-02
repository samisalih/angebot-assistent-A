
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const AuthDialog = ({ open, onOpenChange, onSuccess }: AuthDialogProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();

  // Close dialog if user becomes authenticated
  if (user && open) {
    onOpenChange(false);
    onSuccess?.();
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    console.log('Attempting to sign in with email:', email);
    const { error } = await signIn(email, password);

    if (error) {
      console.error('Sign in failed:', error);
      
      // Handle specific error cases
      if (error.message?.includes('Email not confirmed')) {
        toast({
          title: 'E-Mail nicht bestätigt',
          description: 'Bitte überprüfen Sie Ihr E-Mail-Postfach und klicken Sie auf den Bestätigungslink. Falls Sie keine E-Mail erhalten haben, registrieren Sie sich erneut.',
          variant: 'destructive',
        });
      } else if (error.message?.includes('Invalid login credentials')) {
        toast({
          title: 'Ungültige Anmeldedaten',
          description: 'E-Mail oder Passwort ist falsch.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Anmeldung fehlgeschlagen',
          description: error.message || 'Ein unbekannter Fehler ist aufgetreten.',
          variant: 'destructive',
        });
      }
    } else {
      console.log('Sign in successful');
      toast({
        title: 'Erfolgreich angemeldet',
        description: 'Sie sind jetzt angemeldet.',
      });
    }

    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: 'Passwörter stimmen nicht überein',
        description: 'Bitte stellen Sie sicher, dass beide Passwörter identisch sind.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    console.log('Attempting to sign up with email:', email);
    const { error } = await signUp(email, password);

    if (error) {
      console.error('Sign up failed:', error);
      
      // Handle specific error cases
      if (error.message?.includes('User already registered')) {
        toast({
          title: 'Benutzer bereits registriert',
          description: 'Diese E-Mail-Adresse ist bereits registriert. Versuchen Sie sich anzumelden oder verwenden Sie eine andere E-Mail-Adresse.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Registrierung fehlgeschlagen',
          description: error.message || 'Ein unbekannter Fehler ist aufgetreten.',
          variant: 'destructive',
        });
      }
    } else {
      console.log('Sign up successful');
      toast({
        title: 'Registrierung erfolgreich',
        description: 'Bitte überprüfen Sie Ihre E-Mail für die Bestätigung. Der Link ist 1 Stunde gültig.',
      });
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Anmelden oder Registrieren</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Anmelden</TabsTrigger>
            <TabsTrigger value="signup">Registrieren</TabsTrigger>
          </TabsList>
          
          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <Label htmlFor="signin-email">E-Mail</Label>
                <Input
                  id="signin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="signin-password">Passwort</Label>
                <Input
                  id="signin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Anmeldung...' : 'Anmelden'}
              </Button>
              <div className="text-sm text-muted-foreground text-center">
                Falls Sie eine "E-Mail nicht bestätigt" Fehlermeldung erhalten, 
                registrieren Sie sich bitte erneut mit derselben E-Mail-Adresse.
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <Label htmlFor="signup-email">E-Mail</Label>
                <Input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="signup-password">Passwort</Label>
                <Input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="confirm-password">Passwort bestätigen</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Registrierung...' : 'Registrieren'}
              </Button>
              <div className="text-sm text-muted-foreground text-center">
                Nach der Registrierung erhalten Sie eine E-Mail zur Bestätigung Ihres Kontos.
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
