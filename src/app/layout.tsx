import './globals.css';
import { ClusterProvider } from '@/components/cluster/cluster-data-access';
import { SolanaProvider } from '@/components/solana/solana-provider';
import { ADLaM_Display, Inter } from 'next/font/google';
import { UiLayout } from '@/components/ui/ui-layout';
import { ReactQueryProvider } from './react-query-provider';
import { ProfileRedirectWrapper } from '@/components/user-profile/profile-redirect-wrapper';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/providers/auth-provider';

export const metadata = {
  title: 'Tailor Module',
  description: 'Made-to-order fashion platform',
};

const adLamDisplay = ADLaM_Display({
  variable: '--font-adlam-display',
  subsets: ['latin'],
  weight: '400',
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const links: { label: string; path: string }[] = [
  { label: 'Account', path: '/account' },
  { label: 'Clusters', path: '/clusters' },
  { label: 'Counter Program', path: '/counter' },
  { label: 'Sign Message', path: '/sign-message' },
  { label: 'Send Transaction', path: '/send-transaction' },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${adLamDisplay.variable} ${inter.variable}`}>
        <ReactQueryProvider>
          <ClusterProvider>
            <SolanaProvider>
              <AuthProvider>
                <ProfileRedirectWrapper>
              {/* <UiLayout links={links}>{children}</UiLayout> */}
              {children}
                </ProfileRedirectWrapper>
              </AuthProvider>
              <Toaster position="bottom-right" />
            </SolanaProvider>
          </ClusterProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
