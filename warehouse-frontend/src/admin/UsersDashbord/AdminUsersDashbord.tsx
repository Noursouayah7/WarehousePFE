'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/src/auth/AuthProvider';
import { UserRole } from '@/src/auth/auth.types';
import {
	AdminDashboardUser,
	deleteAdminUser,
	getAdminUsers,
	updateAdminUserRole,
} from './UserDashbord.admin.api';

type ActiveRole = Exclude<UserRole, 'PENDING'>;

const ROLE_OPTIONS: ActiveRole[] = ['ADMIN', 'MANAGER', 'TECHNICIEN'];

export default function AdminUsersDashbord() {
	const { token } = useAuth();
	const [users, setUsers] = useState<AdminDashboardUser[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isVisible, setIsVisible] = useState(true);
	const [detailsUserId, setDetailsUserId] = useState<number | null>(null);
	const [confirmDeleteUserId, setConfirmDeleteUserId] = useState<number | null>(null);
	const [roleUpdatingUserId, setRoleUpdatingUserId] = useState<number | null>(null);
	const [deletingUserId, setDeletingUserId] = useState<number | null>(null);

	useEffect(() => {
		const accessToken = token;

		if (!accessToken) {
			setIsLoading(false);
			setError('Missing auth token. Please login again.');
			return;
		}

		const activeToken: string = accessToken;

		let isMounted = true;

		async function loadUsers() {
			setIsLoading(true);
			setError(null);

			try {
				const data = await getAdminUsers(activeToken);
				if (isMounted) {
					setUsers(data);
				}
			} catch (err) {
				if (isMounted) {
					setError(err instanceof Error ? err.message : 'Failed to load users');
				}
			} finally {
				if (isMounted) {
					setIsLoading(false);
				}
			}
		}

		void loadUsers();

		return () => {
			isMounted = false;
		};
	}, [token]);

	const usersCount = useMemo(() => users.length, [users]);

	async function handleRoleChange(userId: number, nextRole: ActiveRole) {
		const accessToken = token;

		if (!accessToken) {
			setError('Missing auth token. Please login again.');
			return;
		}

		setRoleUpdatingUserId(userId);
		setError(null);

		try {
			const updated = await updateAdminUserRole(accessToken, userId, nextRole);
			setUsers((current) => current.map((user) => (user.id === userId ? updated : user)));
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to update role');
		} finally {
			setRoleUpdatingUserId(null);
		}
	}

	async function handleDeleteUser(userId: number) {
		const accessToken = token;

		if (!accessToken) {
			setError('Missing auth token. Please login again.');
			return;
		}

		setDeletingUserId(userId);
		setError(null);

		try {
			await deleteAdminUser(accessToken, userId);
			setUsers((current) => current.filter((user) => user.id !== userId));
			setConfirmDeleteUserId(null);
			if (detailsUserId === userId) {
				setDetailsUserId(null);
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to delete user');
		} finally {
			setDeletingUserId(null);
		}
	}

	const confirmDeleteUser = users.find((user) => user.id === confirmDeleteUserId) ?? null;

	return (
		<section className="mt-14 rounded border border-[#1a1a1a] bg-[#101010] p-6">
			<div className="mb-5 flex flex-wrap items-center justify-between gap-3">
				<div>
					<h2 className="text-xl font-bold tracking-[0.08em]">USERS DASHBOARD</h2>
					<p className="mt-1 text-[12px] tracking-[0.1em] text-[#666]">{usersCount} users</p>
				</div>

				<button
					type="button"
					onClick={() => setIsVisible((current) => !current)}
					className="inline-flex items-center gap-2 border border-[#2b2b2b] bg-transparent px-3 py-2 text-[11px] tracking-[0.15em] text-[#aaa] transition-colors hover:border-[#3e3e3e] hover:text-white"
				>
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
						<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
						<circle cx="12" cy="12" r="3" />
					</svg>
					{isVisible ? 'HIDE USERS' : 'SHOW USERS'}
				</button>
			</div>

			{error && (
				<div className="mb-4 border border-[#5a1a1a] bg-[#1a0a0a] px-4 py-3 text-[12px] tracking-[0.06em] text-[#ff8a8a]">
					{error}
				</div>
			)}

			{!isVisible ? (
				<div className="py-10 text-center text-[12px] tracking-[0.12em] text-[#555]">USERS TABLE IS HIDDEN</div>
			) : isLoading ? (
				<div className="py-10 text-center text-[12px] tracking-[0.12em] text-[#777]">LOADING USERS...</div>
			) : (
				<div className="overflow-x-auto">
					<table className="min-w-full border-collapse">
						<thead>
							<tr className="border-b border-[#222] text-left text-[11px] tracking-[0.18em] text-[#7a7a7a]">
								<th className="px-3 py-3">ID</th>
								<th className="px-3 py-3">EMAIL</th>
								<th className="px-3 py-3">NAME</th>
								<th className="px-3 py-3">ROLE</th>
								<th className="px-3 py-3">MORE</th>
								<th className="px-3 py-3">DELETE</th>
							</tr>
						</thead>
						<tbody>
							{users.map((user) => {
								const isPending = user.roles === 'PENDING' || !user.roles;
								const isRoleUpdating = roleUpdatingUserId === user.id;
								const isDeleting = deletingUserId === user.id;
								const isDetailsOpen = detailsUserId === user.id;

								return (
									<tr
										key={user.id}
										className={isPending ? 'border-b border-[#3f2f15] bg-[#2a200f]' : 'border-b border-[#1c1c1c]'}
									>
										<td className="px-3 py-3 text-[12px] text-[#ddd]">{user.id}</td>
										<td className="px-3 py-3 text-[12px] text-[#d7d7d7]">{user.email}</td>
										<td className="px-3 py-3 text-[12px] text-[#d7d7d7]">{user.name ?? '-'}</td>
										<td className="px-3 py-3">
											<select
												value={isPending ? '' : user.roles}
												onChange={(event) => {
													const nextRole = event.target.value as ActiveRole;
													if (nextRole) {
														void handleRoleChange(user.id, nextRole);
													}
												}}
												disabled={isRoleUpdating || isDeleting}
												className="w-[170px] border border-[#2b2b2b] bg-[#0b0b0b] px-2 py-1.5 text-[11px] tracking-[0.08em] text-white outline-none disabled:cursor-not-allowed disabled:opacity-50"
											>
												<option value="">NO ROLE / PENDING</option>
												{ROLE_OPTIONS.map((roleOption) => (
													<option key={roleOption} value={roleOption}>
														{roleOption}
													</option>
												))}
											</select>
										</td>
										<td className="relative px-3 py-3">
											<button
												type="button"
												onClick={() => setDetailsUserId((current) => (current === user.id ? null : user.id))}
												className="h-8 w-8 border border-[#2b2b2b] text-[16px] leading-none text-[#aaa] transition-colors hover:border-[#3b3b3b] hover:text-white"
												aria-label={`Toggle details for user ${user.id}`}
											>
												...
											</button>

											{isDetailsOpen && (
												<div className="absolute right-3 top-12 z-20 w-[240px] border border-[#2b2b2b] bg-[#0c0c0c] p-3 text-[12px] text-[#d6d6d6] shadow-lg">
													<p className="mb-2 text-[10px] tracking-[0.16em] text-[#7a7a7a]">USER DETAILS</p>
													<p className="mb-1"><span className="text-[#8a8a8a]">Address:</span> {user.address ?? '-'}</p>
													<p className="mb-1"><span className="text-[#8a8a8a]">Phone:</span> {user.phone ?? '-'}</p>
													<p><span className="text-[#8a8a8a]">CIN:</span> {user.cin}</p>
												</div>
											)}
										</td>
										<td className="px-3 py-3">
											<button
												type="button"
												onClick={() => setConfirmDeleteUserId(user.id)}
												disabled={isDeleting || isRoleUpdating}
												className="border border-[#5a1f1f] bg-[#2a0f0f] px-3 py-1.5 text-[11px] tracking-[0.12em] text-[#ff9f9f] transition-colors hover:border-[#7a2f2f] hover:text-[#ffd0d0] disabled:cursor-not-allowed disabled:opacity-40"
											>
												{isDeleting ? 'DELETING...' : 'DELETE'}
											</button>
										</td>
									</tr>
								);
							})}

							{users.length === 0 && (
								<tr>
									<td colSpan={6} className="px-3 py-8 text-center text-[12px] tracking-[0.12em] text-[#666]">
										NO USERS FOUND
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			)}

			{confirmDeleteUser && (
				<div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 px-4">
					<div className="w-full max-w-md border border-[#2b2b2b] bg-[#0f0f0f] p-6 shadow-2xl">
						<p className="mb-2 text-[11px] tracking-[0.22em] text-[#7a7a7a]">DELETE USER</p>
						<h3 className="mb-3 text-xl font-bold tracking-[0.04em] text-white">
							Are you sure you want to delete this user?
						</h3>
						<p className="mb-6 text-[13px] tracking-[0.04em] text-[#9a9a9a]">
							{confirmDeleteUser.email}
						</p>
						<div className="flex justify-end gap-3">
							<button
								type="button"
								onClick={() => setConfirmDeleteUserId(null)}
								className="border border-[#2b2b2b] px-4 py-2 text-[11px] tracking-[0.14em] text-[#b5b5b5] transition-colors hover:border-[#3a3a3a] hover:text-white"
							>
								CANCEL
							</button>
							<button
								type="button"
								onClick={() => void handleDeleteUser(confirmDeleteUser.id)}
								disabled={deletingUserId === confirmDeleteUser.id}
								className="border border-[#5a1f1f] bg-[#2a0f0f] px-4 py-2 text-[11px] tracking-[0.14em] text-[#ff9f9f] transition-colors hover:border-[#7a2f2f] hover:text-[#ffd0d0] disabled:cursor-not-allowed disabled:opacity-40"
							>
								{deletingUserId === confirmDeleteUser.id ? 'DELETING...' : 'DELETE USER'}
							</button>
						</div>
					</div>
				</div>
			)}
		</section>
	);
}
