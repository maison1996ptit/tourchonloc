'use client';

import React, { useEffect, useState } from 'react';
import TourForm from '@/components/admin/TourForm';
import { tourService } from '@/services/tourService';
import { Tour } from '@/types/tour';
import { useParams } from 'next/navigation';

export default function EditTourPage() {
  const params = useParams();
  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTour = async () => {
      const tours = await tourService.getTours();
      const found = tours.find(t => t.id === params.id);
      if (found) setTour(found);
      setLoading(false);
    };
    fetchTour();
  }, [params.id]);

  if (loading) return <div>Loading tour data...</div>;
  if (!tour) return <div>Tour not found.</div>;

  return <TourForm initialData={tour} isEdit={true} />;
}
