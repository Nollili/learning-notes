// Button.tsx
import type { ComponentPropsWithRef } from 'react';
import styles from './Button.module.css';

export type ButtonProps = Omit<ComponentPropsWithRef<'button'>, 'children'> & {
  children: string;
  variant?: 'primary' | 'secondary';
};
export function Button({ children, variant = 'primary', type = 'button',
  className, ref, ...native }: ButtonProps) {
  return <button {...native} ref={ref} type={type}
    className={[styles.button, styles[variant], className].filter(Boolean).join(' ')}>
    {children}
  </button>;
}
