
import { KnowledgeItem } from "@/hooks/useKnowledgeBase";
import { KnowledgeItemCard } from "./KnowledgeItemCard";

interface KnowledgeListProps {
  items: KnowledgeItem[];
  onEdit: (item: KnowledgeItem) => void;
  onDelete: (id: string) => void;
}

export const KnowledgeList = ({ items, onEdit, onDelete }: KnowledgeListProps) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Noch keine Wissensbeiträge vorhanden. Erstellen Sie den ersten Beitrag!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <KnowledgeItemCard
          key={item.id}
          item={item}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
