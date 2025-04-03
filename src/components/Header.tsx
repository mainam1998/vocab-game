'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="text-xl font-bold">
            English Vocab Game
          </Link>
        </div>
        <nav className="flex items-center gap-4">
          <Link href="/">
            <Button variant={pathname === '/' ? 'default' : 'ghost'}>
              Play Game
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant={pathname === '/dashboard' ? 'default' : 'ghost'}>
              Dashboard
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
