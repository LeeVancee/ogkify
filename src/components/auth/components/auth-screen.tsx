'use client';

import React, { useState } from 'react';
import { SignInFlow } from '../types';
import { GalleryVerticalEnd } from 'lucide-react';
import { SignupForm } from './signup-form';
import { LoginForm } from './login-form';

export default function AuthScreen() {
  const [state, setState] = useState<SignInFlow>('signIn');

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            OGKIFY Inc.
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            {state === 'signIn' ? <LoginForm setState={setState} /> : <SignupForm setState={setState} />}
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <img
          src="https://static.zerochan.net/%CE%BC%E2%80%99s.full.2531708.jpg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
