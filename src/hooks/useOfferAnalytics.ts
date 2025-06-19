
import { useState, useEffect } from 'react';
import { Offer } from '@/types/offer';
import { PerformanceMonitor } from '@/infrastructure/PerformanceMonitor';

interface OfferAnalytics {
  averageValue: number;
  totalOffers: number;
  conversionRate: number;
  topServices: Array<{ name: string; count: number }>;
  monthlyTrend: Array<{ month: string; count: number; value: number }>;
}

export const useOfferAnalytics = (offers: Offer[]) => {
  const [analytics, setAnalytics] = useState<OfferAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const calculateAnalytics = () => {
      const timer = PerformanceMonitor.startTimer('offer_analytics_calculation');
      
      try {
        if (!offers || offers.length === 0) {
          setAnalytics({
            averageValue: 0,
            totalOffers: 0,
            conversionRate: 0,
            topServices: [],
            monthlyTrend: []
          });
          return;
        }

        // Calculate average value
        const averageValue = offers.reduce((sum, offer) => sum + offer.totalPrice, 0) / offers.length;

        // Calculate top services
        const serviceCount = new Map<string, number>();
        offers.forEach(offer => {
          offer.items.forEach(item => {
            const current = serviceCount.get(item.name) || 0;
            serviceCount.set(item.name, current + 1);
          });
        });

        const topServices = Array.from(serviceCount.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        // Calculate monthly trend (mock data for now)
        const monthlyTrend = [
          { month: 'Jan', count: Math.floor(offers.length * 0.1), value: averageValue * 0.8 },
          { month: 'Feb', count: Math.floor(offers.length * 0.15), value: averageValue * 0.9 },
          { month: 'Mär', count: Math.floor(offers.length * 0.2), value: averageValue * 1.1 },
          { month: 'Apr', count: Math.floor(offers.length * 0.25), value: averageValue * 1.2 },
          { month: 'Mai', count: Math.floor(offers.length * 0.3), value: averageValue * 1.0 },
        ];

        setAnalytics({
          averageValue,
          totalOffers: offers.length,
          conversionRate: 0.65, // Mock conversion rate
          topServices,
          monthlyTrend
        });
      } catch (error) {
        console.error('Error calculating offer analytics:', error);
        PerformanceMonitor.recordError('offer_analytics_calculation');
      } finally {
        timer.stop();
        setIsLoading(false);
      }
    };

    calculateAnalytics();
  }, [offers]);

  return { analytics, isLoading };
};
