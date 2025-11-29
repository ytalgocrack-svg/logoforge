import { Wrench } from 'lucide-react';
import Link from 'next/link';

export default function Maintenance() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-center p-6 text-white">
      <div className="bg-blue-600/20 p-8 rounded-full mb-6 animate-pulse">
        <Wrench size={64} className="text-blue-500" />
      </div>
      <h1 className="text-5xl font-extrabold mb-4">Under Maintenance</h1>
      <p className="text-xl text-slate-400 max-w-lg mb-8">
        We are currently updating the site to bring you better assets. 
        Please check back in a few minutes!
      </p>
      {/* Hidden backdoor for admins to log in */}
      <Link href="/auth" className="text-slate-800 text-sm hover:text-slate-700">Admin Login</Link>
    </div>
  );
}
