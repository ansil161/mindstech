import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from '../../../api/axios';
import './EWasteCollectionRequest.css';

const EWasteCollectionRequest = () => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitSuccess(false);
    setSubmitError('');
    try {
      await axios.post('/admin/enquiries/submit/', {
        name,
        company,
        email,
        subject: 'E-Waste collection request',
        message: `${msg}\n\nCountry: India`,
      });
      setSubmitSuccess(true);
      setName('');
      setCompany('');
      setEmail('');
      setMsg('');
    } catch (err) {
      console.error(err);
      const data = err.response?.data;
      let errorMsg = t('contact.form.error_generic');
      if (data && typeof data === 'object') {
        const key = Object.keys(data)[0];
        const val = data[key];
        errorMsg = Array.isArray(val) ? `${key}: ${val[0]}` : `${key}: ${val}`;
      } else if (typeof data === 'string') {
        errorMsg = data;
      }
      setSubmitError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="ewr" aria-label="Request a collection">
      <div className="ewr-head" data-reveal>
        <span className="label label--red">{t('ewaste.request.label', 'Collection')}</span>
        <h2 className="display">{t('ewaste.request.title_main', 'Request a')} <em>{t('ewaste.request.title_em', 'collection.')}</em></h2>
      </div>
      <form className="ct-form" onSubmit={handleSubmit} aria-label="Request a collection">
        <div className="ct-row">
          <div className="ct-field">
            <label htmlFor="ewName">{t('contact.form.name')}</label>
            <input type="text" id="ewName" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
          </div>
          <div className="ct-field">
            <label htmlFor="ewCompany">{t('contact.page.company', 'Company')}</label>
            <input type="text" id="ewCompany" value={company} onChange={(e) => setCompany(e.target.value)} autoComplete="organization" />
          </div>
        </div>
        <div className="ct-field">
          <label htmlFor="ewEmail">{t('contact.page.work_email', 'Work email')}</label>
          <input type="email" id="ewEmail" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </div>
        <div className="ct-field">
          <label htmlFor="ewMsg">{t('ewaste.request.msg_label', 'Equipment type and quantity')}</label>
          <textarea id="ewMsg" value={msg} onChange={(e) => setMsg(e.target.value)} required minLength={10} />
        </div>
        <p className="ct-note">
          {t('contact.page.privacy', 'We use these details to answer your enquiry. Data controller: Mindstec Global. See our privacy notice.')}
        </p>
        {submitSuccess && <div className="ct-alert ct-alert--ok" role="status">{t('contact.form.success')}</div>}
        {submitError && <div className="ct-alert ct-alert--err" role="alert">{submitError}</div>}
        <button type="submit" className="ct-btn ct-btn--solid ct-btn--lg" disabled={isSubmitting}>
          {isSubmitting ? t('contact.form.submitting') : t('ewaste.request.cta', 'Request collection')}
        </button>
      </form>
    </section>
  );
};

export default EWasteCollectionRequest;
