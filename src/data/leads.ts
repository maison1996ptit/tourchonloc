import { Lead } from '@/types/lead';

export const mockLeads: Lead[] = [
  {
    id: '1',
    fullName: 'John Doe',
    email: 'john@example.com',
    phone: '+1 234 567 890',
    nationality: 'USA',
    travelDate: '2026-08-15',
    numberOfTravelers: 2,
    message: 'I am interested in a 10-day tour of Vietnam.',
    sourceForm: 'Tour Inquiry',
    status: 'New',
    createdAt: '2026-05-05T09:00:00Z',
    updatedAt: '2026-05-05T09:00:00Z'
  }
];
