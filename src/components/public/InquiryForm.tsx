'use client';

import React, { useState } from 'react';
import { leadService } from '@/services/leadService';
import { LeadSource } from '@/types/lead';
import styles from './inquiry-form.module.css';
import { useLanguage } from '@/hooks/useLanguage';

interface InquiryFormProps {
  source: LeadSource;
  tourTitle?: string;
  preferredDate?: string;
  defaultMessage?: string;
}

export default function InquiryForm({ source, tourTitle, preferredDate, defaultMessage }: InquiryFormProps) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    message: '',
    numberOfTravelers: 2
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  React.useEffect(() => {
    if (defaultMessage) {
      setFormData(prev => ({ ...prev, message: defaultMessage }));
    }
  }, [defaultMessage]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let finalMessage = formData.message;
      if (tourTitle) {
        finalMessage = `Inquiry for: ${tourTitle}\n`;
        if (preferredDate) {
          finalMessage += `Preferred Date: ${preferredDate}\n`;
        }
        finalMessage += `\n${formData.message}`;
      }

      await leadService.createLead({
        ...formData,
        sourceForm: source,
        tourName: tourTitle || undefined,
        message: finalMessage,
        travelDate: preferredDate
      });
      setSubmitted(true);
    } catch {
      alert(t('form.error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className={styles.success}>
        <h3>{t('form.success_title')}</h3>
        <p>{t('form.success_desc')}</p>
        <button onClick={() => setSubmitted(false)} className={styles.btn}>{t('form.send_another')}</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.row}>
        <div className={styles.field}>
          <label>{t('form.full_name')} *</label>
          <input name="fullName" value={formData.fullName} onChange={handleChange} required />
        </div>
        <div className={styles.field}>
          <label>{t('form.phone')} *</label>
          <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
        </div>
      </div>
      
      <div className={styles.row}>
        <div className={styles.field}>
          <label>{t('form.email')} {t('form.optional')}</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} />
        </div>
        <div className={styles.field}>
          <label>{t('form.travelers')} {t('form.optional')}</label>
          <input type="number" name="numberOfTravelers" value={formData.numberOfTravelers} onChange={handleChange} min="1" />
        </div>
      </div>
      
      <div className={styles.field}>
        <label>{t('form.message')} {t('form.optional')}</label>
        <textarea name="message" value={formData.message} onChange={handleChange} rows={4} placeholder={t('form.message_placeholder')} />
      </div>
      
      <div className={styles.socialProof}>
        <span className={styles.proofIcon}>🔥</span> {t('form.social_proof_leads')}
      </div>
      <button type="submit" disabled={submitting} className={styles.submitBtn}>
        {submitting ? t('form.submitting') : t('form.submit')}
      </button>
      <div className={styles.trustBadges}>
        <div className={styles.trustItem}>
          <span className={styles.trustIcon}>🛡️</span>
          <span>{t('form.trust_secure')}</span>
        </div>
        <div className={styles.trustItem}>
          <span className={styles.trustIcon}>⚡</span>
          <span>{t('form.trust_response')}</span>
        </div>
        <div className={styles.trustItem}>
          <span className={styles.trustIcon}>💎</span>
          <span>{t('form.trust_price')}</span>
        </div>
      </div>
    </form>
  );
}
