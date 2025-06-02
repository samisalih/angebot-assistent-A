
import { AIEndpointManager } from "@/components/admin/AIEndpointManager";
import { KnowledgeManager } from "@/components/admin/KnowledgeManager";
import { AdminAuth } from "@/components/admin/AdminAuth";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";

const Admin = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated
    const authStatus = localStorage.getItem("admin_authenticated");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <AdminAuth onAuthenticated={handleAuthenticated} />;
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
              Verwalten Sie KI-Services und die Wissensbasis für optimale Beratung.
            </p>
          </div>

          <Tabs defaultValue="ai-services" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="ai-services">KI-Services</TabsTrigger>
              <TabsTrigger value="knowledge">Wissensbasis</TabsTrigger>
            </TabsList>
            
            <TabsContent value="ai-services">
              <AIEndpointManager />
            </TabsContent>
            
            <TabsContent value="knowledge">
              <KnowledgeManager />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default Admin;
