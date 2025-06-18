
import { KnowledgeManager } from "@/components/admin/KnowledgeManager";
import { SecureAdminAuth } from "@/components/admin/SecureAdminAuth";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";

const Admin = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isAdmin, isAdminLoading } = useAdminAuth();

  const handleAuthenticated = () => {
    // This will be handled by the useAdminAuth hook
    console.log('Admin authenticated');
  };

  // Show loading state while checking admin status
  if (isAdminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-semibold">Überprüfe Administrator-Berechtigung...</div>
        </div>
      </div>
    );
  }

  // Always use SecureAdminAuth - no more insecure password-based auth
  if (!isAdmin) {
    return <SecureAdminAuth onAuthenticated={handleAuthenticated} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <main className="flex-1 container mx-auto px-4 py-8 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Administrator-Bereich
            </h1>
            <p className="text-muted-foreground">
              Verwaltung der Wissensbasis für den KI-Assistenten.
            </p>
          </div>

          <KnowledgeManager />
        </main>
      </div>
    </div>
  );
};

export default Admin;
