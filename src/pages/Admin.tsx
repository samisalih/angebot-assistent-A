
import { AIEndpointManager } from "@/components/admin/AIEndpointManager";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { useState } from "react";

const Admin = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <main className="flex-1 container mx-auto px-4 py-8 lg:px-8">
          <AIEndpointManager />
        </main>
      </div>
    </div>
  );
};

export default Admin;
