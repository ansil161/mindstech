import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from '../../../api/axios';
import './newpages.css';

// Posts to the same enquiry endpoint as Contact, tagged with a distinguishing subject.
const EnquiryForm = ({ id, subject, messageLabel, cta, extra }) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setOk(false); setErr('');
    try {
      await axios.post('/admin/enquiries/submit/', {
        name, company, email, subject, message: extra ? `${msg}\n\n${extra()}` : msg,
      });
      setOk(true); setName(''); setCompany(''); setEmail(''); setMsg('');
    } catch (error) {
      const d = error.response?.data;
      let m = t('contact.form.error_generic');
      if (d && typeof d === 'object') {
        const k = Object.keys(d)[0];
        m = Array.isArray(d[k]) ? `${k}: ${d[k][0]}` : `${k}: ${d[k]}`;
      } else if (typeof d === 'string') m = d;
      setErr(m);
    } finally { setBusy(false); }
  };

  return (
    <form className="ct-form np-form" onSubmit={submit} aria-label={subject}>
      <div className="ct-row">
        <div className="ct-field">
          <label htmlFor={`${id}-n`}>{t('contact.form.name')}</label>
          <input id={`${id}-n`} value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="ct-field">
          <label htmlFor={`${id}-c`}>{t('contact.page.company', 'Company')}</label>
          <input id={`${id}-c`} value={company} onChange={(e) => setCompany(e.target.value)} />
        </div>
      </div>
      <div className="ct-field">
        <label htmlFor={`${id}-e`}>{t('contact.page.work_email', 'Work email')}</label>
        <input id={`${id}-e`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className="ct-field">
        <label htmlFor={`${id}-m`}>{messageLabel}</label>
        <textarea id={`${id}-m`} value={msg} onChange={(e) => setMsg(e.target.value)} required minLength={10} />
      </div>
      {ok && <div className="ct-alert ct-alert--ok" role="status">{t('contact.form.success')}</div>}
      {err && <div className="ct-alert ct-alert--err" role="alert">{err}</div>}
      <button type="submit" className="ct-btn ct-btn--solid ct-btn--lg" disabled={busy}>
        {busy ? t('contact.form.submitting') : cta}
      </button>
    </form>
  );
};

export default EnquiryForm;
