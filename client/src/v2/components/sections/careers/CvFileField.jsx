import React from 'react';
import { useTranslation } from 'react-i18next';
import './careers.css';

const CvFileField = ({ file, onChange }) => {
  const { t } = useTranslation();
  return (
    <div className="ct-field cr-file">
      <label htmlFor="cv-f">{t('careers.cv_file', 'CV (PDF, DOC or DOCX)')}</label>
      <input id="cv-f" type="file" accept=".pdf,.doc,.docx" onChange={(e) => onChange(e.target.files?.[0] || null)} />
      {file && <span className="cr-file__name">{file.name}</span>}
    </div>
  );
};

export default CvFileField;
