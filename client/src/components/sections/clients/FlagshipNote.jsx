import React from 'react';
import { useTranslation } from 'react-i18next';
import './clients-note.css';

// Editorial note under the flagship grid (wireframe: "12 to 20 flagship clients").
const FlagshipNote = () => {
  const { t } = useTranslation();
  return (
    <div className="cln-note">
      <strong>{t('clients.flagship.note_title', '12 to 20 flagship clients')}</strong>
      <span>{t('clients.flagship.note_body', 'Chosen by Mindstec marketing, each with client approval to publish.')}</span>
    </div>
  );
};

export default FlagshipNote;
