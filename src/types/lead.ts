export type LeadStatus = 'New' | 'Contacted' | 'Converted' | 'Failed' | 'Closed';
export type LeadSource = 'Customize Trip' | 'Tour Inquiry' | 'Download Guide' | 'Newsletter' | 'Imported' | 'Visa Inquiry';

export interface Lead {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  nationality?: string;
  travelDate?: string;
  numberOfTravelers?: number;
  message: string;
  sourceForm: LeadSource;
  status: LeadStatus;
  adminNote?: string;
  reminderDate?: string;
  createdAt: string;
  updatedAt: string;
}
