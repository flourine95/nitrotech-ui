'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { GoogleIcon } from '@/components/icons';
import { getOAuthAuthorizationUrl, type OAuthProvider } from '@/lib/api/auth';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';

interface OAuthButtonsProps {
  mode: 'login' | 'register';
}

export function OAuthButtons({ mode }: OAuthButtonsProps) {
  const [redirectingProvider, setRedirectingProvider] = useState<OAuthProvider | null>(null);

  const handleRedirect = async (provider: OAuthProvider) => {
    setRedirectingProvider(provider);

    try {
      const authorizationUrl = await getOAuthAuthorizationUrl(provider);
      window.location.href = authorizationUrl;
    } catch {
      toast.error(`Không thể bắt đầu đăng nhập với ${provider === 'google' ? 'Google' : 'GitHub'}`);
      setRedirectingProvider(null);
    }
  };

  return (
    <>
      <div className="mb-6 grid grid-cols-1 gap-3">
        <Button
          type="button"
          variant="outline"
          className="h-auto w-full justify-center rounded-full px-4 py-3 text-sm whitespace-normal"
          onClick={() => void handleRedirect('google')}
          disabled={redirectingProvider !== null}
        >
          {redirectingProvider === 'google' ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <GoogleIcon className="size-4" />
          )}
          Đăng nhập với Google
        </Button>

        <Button
          type="button"
          variant="outline"
          className="h-auto w-full justify-center rounded-full px-4 py-3 text-sm whitespace-normal"
          onClick={() => void handleRedirect('github')}
          disabled={redirectingProvider !== null}
        >
          {redirectingProvider === 'github' ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <svg viewBox="0 0 24 24" data-icon="inline-start" aria-hidden="true" className="size-4">
              <path
                fill="currentColor"
                d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.41-4.04-1.41-.55-1.37-1.33-1.74-1.33-1.74-1.09-.73.08-.72.08-.72 1.2.09 1.84 1.22 1.84 1.22 1.08 1.81 2.82 1.29 3.5.99.11-.76.42-1.29.76-1.59-2.67-.3-5.47-1.31-5.47-5.86 0-1.3.47-2.37 1.24-3.2-.12-.3-.54-1.53.12-3.18 0 0 1.01-.32 3.3 1.22a11.7 11.7 0 0 1 6 0c2.28-1.54 3.29-1.22 3.29-1.22.67 1.65.25 2.88.12 3.18.78.83 1.24 1.9 1.24 3.2 0 4.56-2.8 5.55-5.48 5.85.43.37.82 1.1.82 2.22v3.29c0 .32.22.7.83.58A12 12 0 0 0 12 .5Z"
              />
            </svg>
          )}
          Đăng nhập với GitHub
        </Button>
      </div>

      <div className="mb-6 flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">
          {mode === 'login' ? 'hoặc đăng nhập bằng email' : 'hoặc đăng ký bằng email'}
        </span>
        <Separator className="flex-1" />
      </div>
    </>
  );
}
