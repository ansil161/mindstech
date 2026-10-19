import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BRANDS, CATS, PN, REG, COUNTRIES, routeFor } from '../../../constants/wireframeData.js';
import './brand-detail.css';

const ADDS = [
  ['bd.add1', 'Pre-sales system design'],
  ['bd.add2', 'Demonstration at the Experience Centre'],
  ['bd.add3', 'Training and certification'],
  ['bd.add4', 'Local stock'],
  ['bd.add5', 'Warranty and RMA support'],
];

export const findWireBrand = (name) =>
  BRANDS.find((b) => b.n.toLowerCase() === String(name || '').toLowerCase());

const Placeholder = ({ title, hint }) => {
  const { t } = useTranslation();
  return (
    <div className="bd-ph">
      <strong>{title}</strong>
      {hint && <span>{hint}</span>}
      <em>{t('newpages.soon', 'Content to come')}</em>
    </div>
  );
};

const EnquiryForm = ({ brandName }) => {
  const { t } = useTranslation();
  const [country, setCountry] = useState('');
  const [sent, setSent] = useState(false);
  const route = routeFor(country);

  if (sent) {
    return <p className="bd-sent">{t('bd.sent', 'Thank you. Your enquiry has been noted; the team will be in touch.')}</p>;
  }
  return (
    <form
      className="bd-form"
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
    >
      <label>
        <span>{t('bd.f_name', 'Name')}</span>
        <input name="name" required autoComplete="name" />
      </label>
      <label>
        <span>{t('bd.f_company', 'Company')}</span>
        <input name="company" autoComplete="organization" />
      </label>
      <label>
        <span>{t('bd.f_email', 'Work email')}</span>
        <input name="email" type="email" required autoComplete="email" />
      </label>
      <label>
        <span>{t('bd.f_country', 'Country')}</span>
        <select name="country" required value={country} onChange={(e) => setCountry(e.target.value)}>
          <option value="">{t('bd.f_country_ph', 'Select country')}</option>
          {COUNTRIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </label>
      {route && (
        <p className="bd-route">{t('bd.goes_to', 'Goes to')}: {route}</p>
      )}
      <label>
        <span>{t('bd.f_brand', 'Brand')}</span>
        <input name="brand" value={brandName} readOnly />
      </label>
      <label>
        <span>{t('bd.f_message', 'Message')}</span>
        <textarea name="message" rows={4} />
      </label>
      <p className="bd-privacy">
        {t('bd.privacy', 'We use your details only to reply to this enquiry.')}
      </p>
      <button type="submit" className="btn btn--solid">
        <span>{t('bd.submit', 'Send enquiry')}</span>
      </button>
    </form>
  );
};

/**
 * Wireframe-parity sections for a brand page: product categories (placeholder
 * imagery), what Mindstec adds, tagged-content note, and a sidebar with
 * regions + enquiry form. `showSolutions` is for the fallback page only; the
 * regular page already renders its own solutions section.
 */
const BrandDetailExtras = ({ brandName, showSolutions = false }) => {
  const { t } = useTranslation();
  const wb = findWireBrand(brandName);
  const cats = CATS[wb?.n || brandName] || [];
  const list = cats.length ? cats : ['Product category', 'Product category'];

  return (
    <section className="bd" aria-label={t('bd.label', 'Brand details')}>
      <div className="bd-main">
        {showSolutions && wb && (
          <div className="bd-block reveal">
            <span className="label label--red">{t('bd.solutions', 'Solutions')}</span>
            <div className="bd-chips">
              {wb.s.map((s) => (
                <Link key={s} to="/solutions" className="bd-chip">{PN[s]}</Link>
              ))}
            </div>
          </div>
        )}

        <div className="bd-block">
          <span className="label label--red">{t('bd.categories', 'Product categories')}</span>
          <div className="bd-cats">
            {list.map((c, i) => (
              <div className="bd-cat reveal" key={`${c}-${i}`}>
                <div className="bd-strip" aria-hidden="true">
                  {[1, 2, 3].map((n) => (
                    <div className="bd-img" key={n}><span>{t('bd.product', 'Product')}</span></div>
                  ))}
                </div>
                <p className="bd-cap">{t('bd.caption', '1 to 3 selected products · product name as caption')}</p>
                <h3>{c}</h3>
                <Placeholder
                  title={t('bd.desc', 'Description')}
                  hint={t('bd.desc_hint', '30 to 50 words on what this category does and where it is used.')}
                />
              </div>
            ))}
          </div>
          {cats.length > 0 && (
            <p className="bd-note">{t('bd.draft', 'Category names are drafts · confirm with the brand team')}</p>
          )}
        </div>

        <div className="bd-block reveal">
          <span className="label label--red">{t('bd.adds', 'What Mindstec adds')}</span>
          <ul className="bd-adds">
            {ADDS.map(([k, label]) => (
              <li key={k}>
                <span>{t(k, label)}</span>
                <em>{t('bd.confirm', 'Confirm per brand')}</em>
              </li>
            ))}
          </ul>
        </div>

        <p className="bd-note reveal">
          {t(
            'bd.tagged',
            'Projects, Training Academy courses, downloads and news appear here automatically once content is tagged to'
          )}{' '}
          {brandName}.
        </p>
      </div>

      <aside className="bd-side">
        {wb && (
          <div className="bd-card">
            <span className="label">{t('bd.available', 'Available in')}</span>
            <div className="bd-chips">
              {wb.r.map((r) => (
                <Link key={r} to={`/products?region=${r}`} className="bd-chip">{REG[r].n}</Link>
              ))}
            </div>
          </div>
        )}
        <div className="bd-card">
          <h3>{t('bd.enquire', 'Enquire about')} {brandName}</h3>
          <EnquiryForm brandName={brandName} />
        </div>
      </aside>
    </section>
  );
};

export default BrandDetailExtras;
