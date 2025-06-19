
import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X, Calendar, Euro } from "lucide-react";
import { SavedOffer } from "@/types/offer";

interface OfferFiltersProps {
  offers: SavedOffer[];
  onFilteredOffersChange: (filtered: SavedOffer[]) => void;
}

export const OfferFilters = ({ offers, onFilteredOffersChange }: OfferFiltersProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);

  const applyFilters = () => {
    let filtered = [...offers];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(offer =>
        offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.offer_data.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Price range filter
    if (priceRange !== 'all') {
      filtered = filtered.filter(offer => {
        const price = offer.total_price;
        switch (priceRange) {
          case 'low': return price < 1000;
          case 'medium': return price >= 1000 && price < 5000;
          case 'high': return price >= 5000;
          default: return true;
        }
      });
    }

    // Date range filter
    if (dateRange !== 'all') {
      const now = new Date();
      filtered = filtered.filter(offer => {
        const offerDate = new Date(offer.created_at);
        const daysDiff = Math.floor((now.getTime() - offerDate.getTime()) / (1000 * 60 * 60 * 24));
        
        switch (dateRange) {
          case 'week': return daysDiff <= 7;
          case 'month': return daysDiff <= 30;
          case 'quarter': return daysDiff <= 90;
          default: return true;
        }
      });
    }

    onFilteredOffersChange(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setPriceRange('all');
    setDateRange('all');
    onFilteredOffersChange(offers);
  };

  const activeFiltersCount = [searchTerm, priceRange !== 'all', dateRange !== 'all'].filter(Boolean).length;

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Angebote durchsuchen..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setTimeout(applyFilters, 300);
              }}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setIsFiltersVisible(!isFiltersVisible)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filter
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </div>

        {isFiltersVisible && (
          <div className="flex flex-wrap gap-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Euro className="h-4 w-4 text-muted-foreground" />
              <Select value={priceRange} onValueChange={(value) => {
                setPriceRange(value);
                setTimeout(applyFilters, 100);
              }}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Preisbereich" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Preise</SelectItem>
                  <SelectItem value="low">< 1.000€</SelectItem>
                  <SelectItem value="medium">1.000€ - 5.000€</SelectItem>
                  <SelectItem value="high">> 5.000€</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Select value={dateRange} onValueChange={(value) => {
                setDateRange(value);
                setTimeout(applyFilters, 100);
              }}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Zeitraum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Zeiten</SelectItem>
                  <SelectItem value="week">Letzte Woche</SelectItem>
                  <SelectItem value="month">Letzter Monat</SelectItem>
                  <SelectItem value="quarter">Letztes Quartal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="flex items-center gap-1 text-muted-foreground"
              >
                <X className="h-4 w-4" />
                Filter zurücksetzen
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
