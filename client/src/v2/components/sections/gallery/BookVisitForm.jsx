import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import apiClient from '../../../api/axios';
import './gallerySections.css';

const ZONES = ['Control room', 'Boardroom', 'Immersive room', 'Hotel guest room'];

/** Wireframe "Book a visit" form (Experience Centre page). */
export default function BookVisitForm() {
  const { t } = useTranslation();
  const [state, setState] = useState('idle');
  const [zones, setZones] = useState([]);

  const toggle = (z) => setZones((p) => (p.includes(z) ? p.filter((x) => x !== z) : [...p, z]));

  const onSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    setState('sending');
    try {
      await apiClient.post('/admin/enquiries/submit/', {
        name: String(f.get('name') || '').trim(),
        email: String(f.get('email') || '').trim(),
        subject: 'Experience Centre visit',
        message:
          `Zones: ${zones.join(', ') || 'not specified'}\n` +
          `Preferred dates: ${String(f.get('dates') || '').trim() || 'not specified'}`,
        source: 'website',
      });
      setState('sent');
      form.reset();
      setZones([]);
    } catch {
      setState('error');
    }
  };

  return (
    <section className="gsx" aria-label="Book a visit">
      <div className="section-head">
        <div>
          <span className="label label--red">{t('experience.book.label', 'Book a visit')}</span>
          <h2 className="display">
            {t('experience.book.title', 'Request a ')}
            <em>{t('experience.book.title_em', 'visit')}</em>
          </h2>
        </div>
        <p className="side">
          {t('experience.book.desc', 'Book a visit and we will show you the systems that fit your project.')}
        </p>
      </div>
      <form className="office gsx-form" onSubmit={onSubmit}>
        <div className="gsx-row">
          <label>{t('experience.book.name', 'Name')}
            <input name="name" required autoComplete="name" />
          </label>
          <label>{t('experience.book.email', 'Work email')}
            <input name="email" type="email" required autoComplete="email" />
          </label>
        </div>
        <fieldset className="gsx-zones">
          <legend>{t('experience.book.zones', "Zones you'd like to see")}</legend>
          {ZONES.map((z) => (
            <label key={z} className="gsx-ck">
              <input type="checkbox" checked={zones.includes(z)} onChange={() => toggle(z)} /> {z}
            </label>
          ))}
        </fieldset>
        <label>{t('experience.book.dates', 'Preferred dates')}
          <input name="dates" />
        </label>
        <div className="gsx-actions">
          <button className="btn btn--solid" type="submit" disabled={state === 'sending'}>
            <span>{t('experience.book.cta', 'Request a visit')}</span>
          </button>
          <span aria-live="polite" className="gsx-note">
            {state === 'sent' && t('experience.book.sent', 'Thank you. We will be in touch.')}
            {state === 'error' && t('experience.book.error', 'Something went wrong. Please try again.')}
          </span>
        </div>
      </form>
    </section>
  );
}
