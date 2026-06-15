import { 
  getLeads, 
  createLead, 
  updateLead, 
  deleteLead,
  bulkCreateLeads,
  sendMarketingCampaignAction
} from '@/actions/leadActions';

export const leadService = {
  getLeads,
  createLead,
  updateLead,
  deleteLead,
  bulkCreateLeads,
  sendMarketingCampaignAction,
};
