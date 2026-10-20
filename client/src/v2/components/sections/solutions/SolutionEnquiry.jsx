import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from '../../../api/axios';
import './SolutionEnquiry.css';

/** "Talk to a specialist": enquiry form from the wireframe, topic preset to the solution. */
const SolutionEnquiry = ({ solutionName }) => {
  const { t } = useTranslation();
  const anotherLabel = t('solutions.enquiry.another', 'Another solution');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState(solutionName);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setOk(false);
    setErr('');
    try {
      await axios.post('/admin/enquiries/submit/', { name, company, email, subject: topic, message: msg });
      setOk(true);
      setName('');
      setCompany('');
      setEmail('');
      setMsg('');
    } catch {
      setErr(t('contact.form.error_generic', 'Something went wrong. Please try again.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="sq" aria-label={t('solutions.enquiry.label', 'Talk to a specialist')}>
      <div className="sq-inner">
        <div className="sq-copy">
          <span className="label label--red">{t('solutions.enquiry.label', 'Talk to a specialist')}</span>
          <h2 className="display">
            {t('solutions.enquiry.title_main', 'Plan your')} <em>{t('solutions.enquiry.title_em', 'project')}</em>
          </h2>
          <p>{t('solutions.enquiry.desc', 'Tell us about the space and we will connect you with the right team.')}</p>
          <p className="sq-soon">{t('solutions.enquiry.courses', 'Related Training Academy courses: content to come, shown once courses are published.')}</p>
        </div>

        <form className="sq-form" onSubmit={submit}>
          <div className="sq-row">
            <div className="sq-field">
              <label htmlFor="sqName">{t('contact.form.name', 'Name')}</label>
              <input id="sqName" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="sq-field">
              <label htmlFor="sqCompany">{t('contact.page.company', 'Company')}</label>
              <input id="sqCompany" type="text" value={company} onChange={(e) => setCompany(e.target.value)} />
            </div>
          </div>
          <div className="sq-field">
            <label htmlFor="sqEmail">{t('contact.page.work_email', 'Work email')}</label>
            <input id="sqEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="sq-field">
            <label htmlFor="sqTopic">{t('contact.page.topic', 'Topic')}</label>
            <select id="sqTopic" value={topic} onChange={(e) => setTopic(e.target.value)}>
              <option value={solutionName}>{solutionName}</option>
              <option value={anotherLabel}>{anotherLabel}</option>
            </select>
          </div>
          <div className="sq-field">
            <label htmlFor="sqMsg">{t('contact.page.help', 'How can we help?')}</label>
            <textarea id="sqMsg" value={msg} onChange={(e) => setMsg(e.target.value)} required minLength={10} />
          </div>
          {ok && <div className="sq-alert" role="status">{t('contact.form.success', 'Thank you. We will be in touch.')}</div>}
          {err && <div className="sq-alert sq-alert--err" role="alert">{err}</div>}
          <button type="submit" className="sq-btn" disabled={busy}>
            {busy ? t('contact.form.submitting', 'Sending...') : t('contact.page.send', 'Send enquiry')}
          </button>
        </form>
      </div>
    </section>
  );
};

export default SolutionEnquiry;
