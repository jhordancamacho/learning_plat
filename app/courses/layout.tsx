import Navbar from '@/components/navbar';
import { SessionProvider } from '@/components/session-provider';

export default function CoursesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </SessionProvider>
  );
}