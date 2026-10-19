import React from 'react';
import { useTranslation } from 'react-i18next';
import { CONTACT_OFFICES } from '../../../constants/contactOffices';
import './careers.css';

// Three role placeholders (title, office, function), filtered by the selected region chip.
const SLOTS = [0, 1, 2];

const RoleSlots = ({ region }) => {
  const { t } = useTranslation();
  const pool = region === 'all' ? CONTACT_OFFICES : CONTACT_OFFICES.filter((o) => o.team === region);
  return (
    <ul className="cr-roles">
      {SLOTS.map((i) => {
        const o = pool.length ? pool[i % pool.length] : null;
        return (
          <li key={i} className="cr-role">
            <strong>{t('careers.role_title', 'Role title')}</strong>
            <span>{t('careers.role_office', 'Office')}: {o ? `${o.city}, ${o.country}` : '—'}</span>
            <span>{t('careers.role_function', 'Function')}</span>
          </li>
        );
      })}
    </ul>
  );
};

export default RoleSlots;
