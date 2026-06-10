'use server';

import { prisma } from '@/lib/prisma';
import { Lead, LeadStatus, LeadSource } from '@/types/lead';
import { revalidatePath } from 'next/cache';
import { isEditor } from '@/lib/auth-utils';

export async function getLeads() {
  if (!(await isEditor())) throw new Error('Unauthorized');

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
      status: 'New',
    }
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
    createdAt: l.createdAt.toISOString(),
    updatedAt: l.updatedAt.toISOString(),
  };
}

export async function updateLead(id: string, updates: Partial<Lead>) {
  if (!(await isEditor())) throw new Error('Unauthorized');

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
    createdAt: l.createdAt.toISOString(),
    updatedAt: l.updatedAt.toISOString(),
  };
}

export async function bulkCreateLeads(leads: any[]) {
  if (!(await isEditor())) throw new Error('Unauthorized');

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
      status: l.status || 'New',
    }))
  });
  revalidatePath('/admin/leads');
  return result;
}

export async function deleteLead(id: string) {
  if (!(await isEditor())) throw new Error('Unauthorized');

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
