import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import apiClient from '../../../api/axios';
import { COUNTRIES, routeFor } from '../../../constants/wireframeData.js';
import './galleryNew.css';

const TOPIC = 'Experience Centre: location to confirm';

/** Wireframe "Book a visit" enquiry form with country routing line. */
export default function GalleryBookVisit() {
  const { t } = useTranslation();
  const [country, setCountry] = useState('');
  const [state, setState] = useState('idle');

  const onSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const v = (k) => String(f.get(k) || '').trim();
    setState('sending');
    try {
      await apiClient.post('/admin/enquiries/submit/', {
        name: v('name'),
        company: v('company'),
        email: v('email'),
        subject: 'Experience Centre visit',
        message: `Topic: ${TOPIC}\nCountry: ${country || 'not specified'}\nRouted to: ${routeFor(country, TOPIC) || 'n/a'}\n\n${v('message')}`,
        source: 'website',
      });
      setState('sent');
      form.reset();
      setCountry('');
    } catch {
      setState('error');
    }
  };

  const route = routeFor(country);

  return (
    <section className="gnx" id="book-visit" aria-label="Book a visit">
      <div className="section-head">
        <div>
          <span className="label label--red">{t('gallery.book.label', 'Book a visit')}</span>
          <h2 className="display">
            {t('gallery.book.title', 'Request a ')}
            <em>{t('gallery.book.title_em', 'visit')}</em>
          </h2>
        </div>
        <p className="side">
          {t('gallery.book.desc', 'Book a visit and we will show you the systems that fit your project.')}
        </p>
      </div>
      <form className="office gnx-form" onSubmit={onSubmit}>
        <div className="gnx-row">
          <label>{t('gallery.book.name', 'Name')}<input name="name" required autoComplete="name" /></label>
          <label>{t('gallery.book.company', 'Company')}<input name="company" autoComplete="organization" /></label>
        </div>
        <div className="gnx-row">
          <label>{t('gallery.book.email', 'Work email')}<input name="email" type="email" required autoComplete="email" /></label>
          <label>{t('gallery.book.country', 'Country')}
            <select value={country} onChange={(e) => setCountry(e.target.value)} required>
              <option value="">{t('gallery.book.country_ph', 'Select a country')}</option>
              {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
        </div>
        {route && (
          <p className="gnx-note" aria-live="polite">
            {t('gallery.book.route', 'Your enquiry will go to: {{team}}', { team: route })}
          </p>
        )}
        <label>{t('gallery.book.topic', 'Topic')}<input value={TOPIC} readOnly /></label>
        <label>{t('gallery.book.message', "Preferred dates and what you'd like to see")}
          <textarea name="message" rows={4} required />
        </label>
        <p className="gnx-note">
          {t('gallery.book.privacy', 'We use your details only to respond to this enquiry.')}
        </p>
        <div className="gnx-actions">
          <button className="btn btn--solid" type="submit" disabled={state === 'sending'}>
            <span>{t('gallery.book.cta', 'Request a visit')}</span>
          </button>
          <span aria-live="polite" className="gnx-note">
            {state === 'sent' && t('gallery.book.sent', 'Thank you. We will be in touch.')}
            {state === 'error' && t('gallery.book.error', 'Something went wrong. Please try again.')}
          </span>
        </div>
      </form>
    </section>
  );
}
