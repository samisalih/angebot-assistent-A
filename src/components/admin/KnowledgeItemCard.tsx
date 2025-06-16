
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { KnowledgeItem } from "@/hooks/useKnowledgeBase";

interface KnowledgeItemCardProps {
  item: KnowledgeItem;
  onEdit: (item: KnowledgeItem) => void;
  onDelete: (id: string) => void;
}

export const KnowledgeItemCard = ({ item, onEdit, onDelete }: KnowledgeItemCardProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{item.title}</CardTitle>
            {item.category && (
              <CardDescription className="mt-1">
                Kategorie: {item.category}
              </CardDescription>
            )}
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(item)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(item.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
          {item.content.substring(0, 200)}
          {item.content.length > 200 && "..."}
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          Erstellt: {new Date(item.created_at).toLocaleDateString("de-DE")} | 
          Aktualisiert: {new Date(item.updated_at).toLocaleDateString("de-DE")}
        </div>
      </CardContent>
    </Card>
  );
};
