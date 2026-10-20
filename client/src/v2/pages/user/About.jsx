import React, { useEffect } from 'react';
import AboutServices from '../../components/sections/about/AboutServices.jsx';

const About = () => {
  useEffect(() => {
    document.title = 'About us \u2014 Mindstec Distribution';
    window.scrollTo(0, 0);
  }, []);

  return (
    <main id="top" className="about-services-page">
      <AboutServices />
    </main>
  );
};

export default About;
