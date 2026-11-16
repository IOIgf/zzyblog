import { type ReactNode } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import ThemeColor from './ThemeColor';
import LaikitProvider from '@site/src/components/LaikitProvider';
import ImageZoom from '@site/src/components/ImageZoom';

interface RootProps {
  children: ReactNode;
}

export default function Root({ children }: RootProps) {
  return (
    <LaikitProvider>
      {children}
      <BrowserOnly>{() => <ThemeColor />}</BrowserOnly>
      <ImageZoom />
    </LaikitProvider>
  );
}
