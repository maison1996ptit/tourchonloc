import { 
  getTours, 
  getTourBySlug, 
  createTour, 
  updateTour, 
  deleteTour, 
  bulkCreateTours 
} from '@/actions/tourActions';

export const tourService = {
  getTours,
  getTourBySlug,
  createTour,
  updateTour,
  deleteTour,
  bulkCreateTours,
};
