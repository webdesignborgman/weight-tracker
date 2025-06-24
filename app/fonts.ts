// app/fonts.ts
import localFont from 'next/font/local';

export const geist = localFont({
  src: [
    {
      path: '../public/fonts/Geist/Geist-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/Geist/Geist-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  display: 'swap',
  variable: '--font-geist',
});
