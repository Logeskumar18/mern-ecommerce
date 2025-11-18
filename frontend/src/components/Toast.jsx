import React, { useEffect, useState } from 'react';

const Toast = ({ message, type = 'success', duration = 3000, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => {
          if (onClose) onClose();
        }, 300); // Wait for animation to complete
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose]);

  if (!message) return null;

  const toastTypes = {
    success: 'bg-success',
    error: 'bg-danger',
    warning: 'bg-warning',
    info: 'bg-info'
  };

  const icons = {
    success: 'fas fa-check-circle',
    error: 'fas fa-exclamation-circle',
    warning: 'fas fa-exclamation-triangle',
    info: 'fas fa-info-circle'
  };

  return (
    <div 
      className={`position-fixed end-0 top-0 m-3 ${visible ? 'd-block' : 'd-none'}`}
      style={{ 
        zIndex: 1050,
        transition: 'all 0.3s ease-in-out',
        transform: visible ? 'translateY(0)' : 'translateY(-100%)',
        opacity: visible ? 1 : 0
      }}
    >
      <div className={`alert ${toastTypes[type]} text-white border-0 shadow-lg d-flex align-items-center`}>
        <i className={`${icons[type]} me-2`}></i>
        <span>{message}</span>
        <button 
          type="button" 
          className="btn-close btn-close-white ms-2" 
          onClick={() => {
            setVisible(false);
            setTimeout(() => {
              if (onClose) onClose();
            }, 300);
          }}
        ></button>
      </div>
    </div>
  );
};

export default Toast;
