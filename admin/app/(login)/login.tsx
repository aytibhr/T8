'use client';

import { useActionState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Gamepad2, Loader2 } from 'lucide-react';
import { signIn } from './actions';
import { ActionState } from '@/lib/auth/middleware';

export function Login() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    signIn,
    { error: '' }
  );

  return (
    <div className="min-h-[100dvh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#0a0a1a] relative overflow-hidden">
      {/* Background neon glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00f3ff] rounded-full mix-blend-screen filter blur-[150px] opacity-20 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#ff00ea] rounded-full mix-blend-screen filter blur-[150px] opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="bg-[#0f1026] p-4 rounded-xl border-2 border-[#00f3ff] shadow-[0_0_15px_rgba(0,243,255,0.5)]">
            <Gamepad2 className="h-12 w-12 text-[#00f3ff]" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-orbitron font-bold text-white tracking-widest text-shadow-neon-blue">
          TERMINAL 8
        </h2>
        <p className="mt-2 text-center text-[#ff00ea] font-pixel text-xs tracking-wider">
          STAFF ACCESS ONLY
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-[#0f1026]/80 backdrop-blur-md border border-[#00f3ff]/30 py-8 px-4 shadow-[0_0_30px_rgba(0,243,255,0.1)] sm:rounded-xl sm:px-10">
          <form className="space-y-6" action={formAction}>
            <input type="hidden" name="redirect" value={redirect || ''} />
            
            <div>
              <Label
                htmlFor="email"
                className="block text-sm font-mono text-[#00f3ff] uppercase tracking-wider"
              >
                Crew ID (Email)
              </Label>
              <div className="mt-1">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  defaultValue={state.email}
                  required
                  maxLength={50}
                  className="appearance-none rounded bg-[#0a0a1a] relative block w-full px-3 py-2 border border-gray-700 placeholder-gray-600 text-white font-mono focus:outline-none focus:ring-1 focus:ring-[#ff00ea] focus:border-[#ff00ea] focus:z-10 sm:text-sm transition-all"
                  placeholder="enter email..."
                />
              </div>
            </div>

            <div>
              <Label
                htmlFor="password"
                className="block text-sm font-mono text-[#00f3ff] uppercase tracking-wider"
              >
                Passcode
              </Label>
              <div className="mt-1">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  defaultValue={state.password}
                  required
                  minLength={3}
                  maxLength={100}
                  className="appearance-none rounded bg-[#0a0a1a] relative block w-full px-3 py-2 border border-gray-700 placeholder-gray-600 text-white font-mono focus:outline-none focus:ring-1 focus:ring-[#ff00ea] focus:border-[#ff00ea] focus:z-10 sm:text-sm transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {state?.error && (
              <div className="text-[#ff0000] font-mono text-xs border border-[#ff0000]/50 bg-[#ff0000]/10 p-2 rounded">
                [ERROR]: {state.error}
              </div>
            )}

            <div>
              <Button
                type="submit"
                className="w-full flex justify-center items-center py-6 px-4 border-2 border-[#00f3ff] rounded shadow-[0_0_15px_rgba(0,243,255,0.3)] text-sm font-pixel text-white bg-transparent hover:bg-[#00f3ff] hover:text-[#0a0a1a] focus:outline-none transition-all duration-300"
                disabled={pending}
              >
                {pending ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    AUTHENTICATING...
                  </>
                ) : (
                  'INITIALIZE LINK'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
