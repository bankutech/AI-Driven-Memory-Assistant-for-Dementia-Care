import React from 'react';
import styles from './Button.module.css';

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  block = false, 
  className = '', 
  ...props 
}) {
  const classes = [
    styles.button,
    styles[variant],
    styles[size],
    block ? styles.block : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
