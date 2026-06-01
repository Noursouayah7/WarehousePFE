'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/src/auth/AuthProvider';
import { useWorkspaceSearch } from '@/src/common/WorkspaceShell';
import { UserRole } from '@/src/auth/auth.types';
import {
	AdminDashboardUser,
	deleteAdminUser,
	getAdminUsers,
	updateAdminUserRole,
} from './UserDashbord.admin.api';

type ActiveRole = Exclude<UserRole, 'PENDING'>;

const ROLE_OPTIONS: ActiveRole[] = ['ADMIN', 'MANAGER', 'TECHNICIEN', 'CUSTOMER', 'VISITOR'];

export default function AdminUsersDashbord() {
	const { token } = useAuth();
	const { query } = useWorkspaceSearch();
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
	const visibleUsers = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();
		if (!normalizedQuery) return users;
		return users.filter((user) => {
			return [
				String(user.id),
				user.email,
				user.name ?? '',
				user.roles ?? '',
				user.address ?? '',
				user.phone ?? '',
				user.cin,
			].some((value) => value.toLowerCase().includes(normalizedQuery));
		});
	}, [users, query]);

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
		<section className="mt-8 rounded-2xl bg-transparent">
			<div className="mb-5 flex flex-wrap items-center justify-between gap-3">
				<div>
					<h2 className="text-lg font-semibold tracking-tight">Users</h2>
					<p className="mt-1 text-sm text-[var(--muted-foreground)]">{usersCount} users</p>
				</div>

				<button
					type="button"
					onClick={() => setIsVisible((current) => !current)}
					className="inline-flex items-center gap-2 rounded-md border border-[var(--input)] bg-white px-3 py-2 text-xs font-medium text-[var(--muted-foreground)] transition-colors hover:border-[var(--border)] hover:text-[var(--foreground)]"
				>
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
						<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
						<circle cx="12" cy="12" r="3" />
					</svg>
					{isVisible ? 'Hide users' : 'Show users'}
				</button>
			</div>

			{error && (
				<div className="mb-4 flex items-start gap-2 rounded-md bg-[var(--tint-error)] px-3 py-2 text-sm text-[var(--color-error)]">
					<span aria-hidden="true">!</span>
					{error}
				</div>
			)}

			{!isVisible ? (
				<div className="py-10 text-center text-sm text-[var(--muted-foreground)]">Users table is hidden</div>
			) : isLoading ? (
				<div className="py-10 text-center text-sm text-[var(--muted-foreground)]">Loading users...</div>
			) : (
				<div className="overflow-x-auto">
					<table className="min-w-full border-separate border-spacing-y-2">
						<thead>
							<tr className="text-left text-xs font-medium text-[var(--muted-foreground)]">
								<th className="px-3 py-3">ID</th>
								<th className="px-3 py-3">EMAIL</th>
								<th className="px-3 py-3">NAME</th>
								<th className="px-3 py-3">ROLE</th>
								<th className="px-3 py-3">MORE</th>
								<th className="px-3 py-3">DELETE</th>
							</tr>
						</thead>
						<tbody>
							{visibleUsers.map((user) => {
								const isPending = user.roles === 'PENDING' || !user.roles;
								const isRoleUpdating = roleUpdatingUserId === user.id;
								const isDeleting = deletingUserId === user.id;
								const isDetailsOpen = detailsUserId === user.id;

								return (
									<tr
										key={user.id}
										className={isPending ? 'rounded-lg bg-[var(--tint-warning)]' : 'rounded-lg bg-[var(--card)]'}
									>
										<td className="px-3 py-3 text-[12px] text-[var(--foreground)]">{user.id}</td>
										<td className="px-3 py-3 text-[12px] text-[var(--foreground)]">{user.email}</td>
										<td className="px-3 py-3 text-[12px] text-[var(--foreground)]">{user.name ?? '-'}</td>
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
												className="w-[170px] rounded-md border border-[var(--input)] bg-white px-2 py-1.5 text-xs text-[var(--foreground)] outline-none disabled:cursor-not-allowed disabled:opacity-50"
											>
												<option value="">No role / pending</option>
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
																						className="h-8 w-8 rounded-md border border-[var(--input)] text-[16px] leading-none text-[var(--muted-foreground)] transition-colors hover:border-[var(--border)] hover:text-[var(--foreground)]"
												aria-label={`Toggle details for user ${user.id}`}
											>
												...
											</button>

											{isDetailsOpen && (
												<div className="absolute right-3 top-12 z-20 w-[240px] rounded-md border border-[var(--border)] bg-white p-3 text-[12px] text-[var(--foreground)] shadow-lg">
													<p className="mb-2 text-xs font-medium text-[var(--muted-foreground)]">User details</p>
													<p className="mb-1"><span className="text-[var(--muted-foreground)]">Address:</span> {user.address ?? '-'}</p>
													<p className="mb-1"><span className="text-[var(--muted-foreground)]">Phone:</span> {user.phone ?? '-'}</p>
													<p><span className="text-[var(--muted-foreground)]">CIN:</span> {user.cin}</p>
												</div>
											)}
										</td>
										<td className="px-3 py-3">
											<button
												type="button"
												onClick={() => setConfirmDeleteUserId(user.id)}
												disabled={isDeleting || isRoleUpdating}
												className="rounded-md bg-[var(--tint-error)] px-3 py-1.5 text-xs font-medium text-[var(--color-error)] transition-colors disabled:cursor-not-allowed disabled:opacity-40"
											>
												{isDeleting ? 'Deleting...' : 'Delete'}
											</button>
										</td>
									</tr>
								);
							})}

							{visibleUsers.length === 0 && (
								<tr>
									<td colSpan={6} className="px-3 py-8 text-center text-sm text-[var(--muted-foreground)]">
										{query.trim() ? 'No users match your search' : 'No users found'}
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			)}

			{confirmDeleteUser && (
				<div className="fixed inset-0 z-40 flex items-center justify-center bg-[var(--popover-foreground)]/30 px-4 backdrop-blur-sm">
					<div className="w-full max-w-md rounded-xl border border-[var(--border)] bg-white p-6 shadow-xl">
						<p className="mb-2 text-xs font-medium text-[var(--muted-foreground)]">Delete user</p>
						<h3 className="mb-3 text-xl font-semibold tracking-tight text-[var(--foreground)]">
							Are you sure you want to delete this user?
						</h3>
						<p className="mb-6 text-sm text-[var(--muted-foreground)]">
							{confirmDeleteUser.email}
						</p>
						<div className="flex justify-end gap-3">
							<button
								type="button"
								onClick={() => setConfirmDeleteUserId(null)}
								className="rounded-md border border-[var(--input)] bg-white px-4 py-2 text-xs font-medium text-[var(--muted-foreground)] transition-colors hover:border-[var(--border)] hover:text-[var(--foreground)]"
							>
								Cancel
							</button>
							<button
								type="button"
								onClick={() => void handleDeleteUser(confirmDeleteUser.id)}
								disabled={deletingUserId === confirmDeleteUser.id}
								className="rounded-md bg-[var(--tint-error)] px-4 py-2 text-xs font-medium text-[var(--color-error)] transition-colors disabled:cursor-not-allowed disabled:opacity-40"
							>
								{deletingUserId === confirmDeleteUser.id ? 'Deleting...' : 'Delete user'}
							</button>
						</div>
					</div>
				</div>
			)}
		</section>
	);
}
