
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AIServiceConfig } from "@/types/aiServiceConfig";

interface AIServiceTableProps {
  configs: AIServiceConfig[];
  onEdit: (config: AIServiceConfig) => void;
  onDelete: (id: string, serviceName: string) => void;
  isFormOpen: boolean;
}

export const AIServiceTable = ({ configs, onEdit, onDelete, isFormOpen }: AIServiceTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Konfigurierte Services</CardTitle>
        <CardDescription>Übersicht aller AI Services mit sicherer Secret-Verwaltung</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>Endpunkt</TableHead>
              <TableHead>Secret Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {configs.map((config) => (
              <TableRow key={config.id}>
                <TableCell className="font-medium">
                  {config.service_name}
                </TableCell>
                <TableCell className="max-w-xs truncate">{config.endpoint_url}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs">{config.api_key_name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={config.uses_secret_key ? "default" : "secondary"}>
                    {config.uses_secret_key ? "Verschlüsselt" : "Legacy"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(config)}
                      disabled={isFormOpen}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDelete(config.id, config.service_name)}
                      disabled={isFormOpen}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
