'use client';

import { signIn, signOut } from 'next-auth/react';
import { Loader2, LogIn, LogOut } from 'lucide-react';
import { useState } from 'react';

export function SignInButton() {
  const [loading, setLoading] = useState(false);

  return (
    <button
      onClick={() => {
        setLoading(true);
        signIn('google');
      }}
      className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-medium text-gray-900 shadow-sm ring-1 ring-black/10 transition hover:-translate-y-px hover:shadow-md"
      disabled={loading}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
      Đăng nhập với Google
    </button>
  );
}

export function SignOutButton() {
  const [loading, setLoading] = useState(false);

  return (
    <button
      onClick={async () => {
        setLoading(true);
        await signOut();
      }}
      className="inline-flex items-center gap-2 rounded-full bg-transparent px-4 py-2 text-sm font-medium text-white/80 transition hover:text-white"
      disabled={loading}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
      Đăng xuất
    </button>
  );
}
