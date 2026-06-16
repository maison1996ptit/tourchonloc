'use server';

import { prisma } from '@/lib/prisma';
import { Lead, LeadStatus, LeadSource } from '@/types/lead';
import { Tour } from '@/types/tour';
import { revalidatePath } from 'next/cache';
import { sendLeadNotificationEmail, sendMarketingEmail } from '@/lib/mail';

export async function getLeads() {
  const data = await prisma.lead.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return data.map(l => ({
    ...l,
    travelDate: l.travelDate || undefined,
    numberOfTravelers: l.numberOfTravelers || undefined,
    adminNote: l.adminNote || undefined,
    reminderDate: l.reminderDate || undefined,
    sourceForm: l.sourceForm as LeadSource,
    status: l.status as LeadStatus,
    nationality: l.nationality ?? undefined,
    tourName: l.tourName ?? undefined,
    createdAt: l.createdAt.toISOString(),
    updatedAt: l.updatedAt.toISOString(),
  }));
}

export async function createLead(lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'status'>) {
  // Public can create leads (contact form)
  const l = await prisma.lead.create({
    data: {
      fullName: lead.fullName,
      email: lead.email,
      phone: lead.phone,
      nationality: lead.nationality,
      travelDate: lead.travelDate,
      numberOfTravelers: lead.numberOfTravelers,
      message: lead.message,
      sourceForm: lead.sourceForm,
      tourName: lead.tourName,
      status: 'New',
    }
  });

  // Send email notification in the background
  try {
    await sendLeadNotificationEmail(lead);
  } catch (err) {
    console.error('Failed to send lead notification email:', err);
  }

  revalidatePath('/admin/leads');

  return {
    ...l,
    travelDate: l.travelDate || undefined,
    numberOfTravelers: l.numberOfTravelers || undefined,
    adminNote: l.adminNote || undefined,
    reminderDate: l.reminderDate || undefined,
    sourceForm: l.sourceForm as LeadSource,
    status: l.status as LeadStatus,
    nationality: l.nationality ?? undefined,
    tourName: l.tourName ?? undefined,
    createdAt: l.createdAt.toISOString(),
    updatedAt: l.updatedAt.toISOString(),
  };
}

export async function updateLead(id: string, updates: Partial<Lead>) {
  const allowedUpdates: any = {};
  if (updates.fullName !== undefined) allowedUpdates.fullName = updates.fullName;
  if (updates.email !== undefined) allowedUpdates.email = updates.email;
  if (updates.phone !== undefined) allowedUpdates.phone = updates.phone;
  if (updates.status !== undefined) allowedUpdates.status = updates.status;
  if (updates.adminNote !== undefined) allowedUpdates.adminNote = updates.adminNote;
  if (updates.reminderDate !== undefined) allowedUpdates.reminderDate = updates.reminderDate;

  const l = await prisma.lead.update({
    where: { id },
    data: allowedUpdates
  });

  revalidatePath('/admin/leads');

  return {
    ...l,
    travelDate: l.travelDate || undefined,
    numberOfTravelers: l.numberOfTravelers || undefined,
    adminNote: l.adminNote || undefined,
    reminderDate: l.reminderDate || undefined,
    sourceForm: l.sourceForm as LeadSource,
    status: l.status as LeadStatus,
    nationality: l.nationality ?? undefined,
    tourName: l.tourName ?? undefined,
    createdAt: l.createdAt.toISOString(),
    updatedAt: l.updatedAt.toISOString(),
  };
}

export async function bulkCreateLeads(leads: any[]) {
  const result = await prisma.lead.createMany({
    data: leads.map(l => ({
      fullName: l.fullName,
      email: l.email,
      phone: l.phone,
      nationality: l.nationality,
      travelDate: l.travelDate,
      numberOfTravelers: l.numberOfTravelers,
      message: l.message,
      sourceForm: l.sourceForm,
      tourName: l.tourName,
      status: l.status || 'New',
    }))
  });
  revalidatePath('/admin/leads');
  return result;
}

export async function deleteLead(id: string) {
  try {
    await prisma.lead.delete({
      where: { id }
    });
    revalidatePath('/admin/leads');
    return { success: true };
  } catch (e) {
    return { success: false };
  }
}

export async function sendMarketingCampaignAction(
  leadIds: string[],
  subject: string,
  body: string,
  tourIds: string[]
) {
  // Fetch leads and selected tours
  const [selectedLeads, selectedTours] = await Promise.all([
    prisma.lead.findMany({
      where: { id: { in: leadIds } }
    }),
    prisma.tour.findMany({
      where: { id: { in: tourIds } }
    })
  ]);

  // Map tours database model to Tour interface type
  const mappedTours: Tour[] = selectedTours.map(t => ({
    ...t,
    departureDates: t.departureDates,
    highlights: t.highlights,
    itinerary: t.itinerary as any,
    included: t.included,
    excluded: t.excluded,
    priceByGroupSize: t.priceByGroupSize as any,
    status: t.status as any,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  }));

  // Send emails in parallel
  const sendPromises = selectedLeads.map(async (lead) => {
    if (lead.email) {
      try {
        await sendMarketingEmail(lead.email, lead.fullName, subject, body, mappedTours);
      } catch (err) {
        console.error(`Failed to send marketing email to ${lead.email}:`, err);
      }
    }
  });

  await Promise.all(sendPromises);
  return { success: true, count: selectedLeads.filter(l => l.email).length };
}
