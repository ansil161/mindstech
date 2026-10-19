import React from 'react';
import './newpages.css';

// Hero shared by the Training / Careers / Legal pages. Reuses the Contact
// page's .ct-hero rules so the three pages match the rest of the site.
const NewPageHero = ({ crumb, title, lede }) => (
  <section className="ct-hero" aria-label={title}>
    <div className="ct-wrap">
      <span className="ct-crumb">{crumb}</span>
      <h1 className="display">{title}</h1>
      {lede && <p>{lede}</p>}
    </div>
  </section>
);

export default NewPageHero;
