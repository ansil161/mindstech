import React from 'react';
import { useTranslation } from 'react-i18next';
import './newpages.css';

// Section whose real content has not been supplied yet: real heading plus a
// neutral line (same "Content to come" pattern as the Contact page).
const PlaceholderCard = ({ title, hint }) => {
  const { t } = useTranslation();
  return (
    <div className="np-card">
      <h3>{title}</h3>
      {hint && <p>{hint}</p>}
      <div className="np-soon">{t('newpages.soon', 'Content to come')}</div>
    </div>
  );
};

export default PlaceholderCard;
