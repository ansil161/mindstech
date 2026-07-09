import React from 'react';

const Container = ({ children, className = '', ...props }) => {
  return (
    <div className={`px-[var(--pad)] ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Container;
