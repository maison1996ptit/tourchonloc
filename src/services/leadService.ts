import { 
  getLeads, 
  createLead, 
  updateLead, 
  deleteLead,
  bulkCreateLeads
} from '@/actions/leadActions';

export const leadService = {
  getLeads,
  createLead,
  updateLead,
  deleteLead,
  bulkCreateLeads,
};
