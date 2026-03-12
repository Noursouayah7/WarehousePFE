'use client';

import Link from 'next/link';
import { useAuth } from '@/src/auth/AuthProvider';

export default function PendingPage() {
	const { logout } = useAuth();

	return (
		<div className="relative flex min-h-screen items-center justify-center bg-[#0a0a0a] px-6">
			<div className="fixed inset-0 z-0 bg-[length:40px_40px] bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)]" />

			<div className="relative z-10 w-full max-w-2xl border border-[#1a1a1a] bg-[#111] p-10 text-center text-white">
				<p className="mb-3 text-[11px] tracking-[0.3em] text-[#4aa0f0]">ACCOUNT STATUS</p>
				<h1 className="mb-4 text-3xl font-bold tracking-[0.05em]">ROLE VERIFICATION PENDING</h1>
				<p className="mx-auto max-w-xl text-sm tracking-[0.08em] text-[#777]">
					Please wait until we verify your role. You will be able to access your dashboard once your role is assigned.
				</p>

				<div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
					<Link
						href="/login"
						className="w-full border border-[#2a2a2a] px-4 py-3 text-xs tracking-[0.2em] text-[#aaa] transition-colors hover:border-[#3a3a3a] hover:text-white sm:w-auto"
					>
						BACK TO LOGIN
					</Link>
					<button
						onClick={logout}
						className="w-full border-0 bg-[#4aa0f0] px-4 py-3 text-xs font-bold tracking-[0.2em] text-[#0a0a0a] transition-colors hover:bg-[#3f92de] sm:w-auto"
					>
						LOGOUT
					</button>
				</div>
			</div>
		</div>
	);
}
