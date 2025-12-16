// Minimal ambient module declarations for third-party libs missing types

declare module 'class-variance-authority' {
  // cva returns a function that takes props and returns a className string
  export function cva(base?: any, config?: any): (props?: any) => string;
  export type VariantProps<T> = Record<string, any>;
} 

declare module '@radix-ui/react-slot' {
  import * as React from 'react';
  export const Slot: React.ComponentType<any>;
  export default Slot;
}
