'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/src/auth/AuthProvider';
import { useWorkspaceSearch } from '@/src/common/WorkspaceShell';
import {
	getAllReclamations,
	getProblemTypeLabel,
	getStatusColor,
	getStatusLabel,
	updateReclamation,
	type Reclamation,
	type ReclamationStatus,
} from '@/src/customer/reclamation.api';

type DraftState = Record<number, { status: ReclamationStatus; managerNote: string }>;

const statusOptions: ReclamationStatus[] = ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

function formatDate(value: string): string {
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString();
}

function isImageAttachment(attachmentUrl: string): boolean {
	return attachmentUrl.startsWith('data:image');
}

export function ReclamationsBoard() {
	const { token } = useAuth();
	const { query } = useWorkspaceSearch();

	const [reclamations, setReclamations] = useState<Reclamation[]>([]);
	const [drafts, setDrafts] = useState<DraftState>({});
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [savingId, setSavingId] = useState<number | null>(null);

	useEffect(() => {
		if (!token) {
			setError('Missing auth token. Please login again.');
			setIsLoading(false);
			return;
		}

		let mounted = true;
		setIsLoading(true);
		setError(null);

		void getAllReclamations(token)
			.then((data) => {
				if (!mounted) return;
				setReclamations(data);
				setDrafts(
					data.reduce<DraftState>((accumulator, reclamation) => {
						accumulator[reclamation.id] = {
							status: reclamation.status,
							managerNote: reclamation.managerNote ?? '',
						};
						return accumulator;
					}, {}),
				);
			})
			.catch((err: unknown) => {
				if (!mounted) return;
				setError(err instanceof Error ? err.message : 'Failed to load reclamations');
			})
			.finally(() => {
				if (!mounted) return;
				setIsLoading(false);
			});

		return () => {
			mounted = false;
		};
	}, [token]);

	const visibleReclamations = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();
		if (!normalizedQuery) return reclamations;

		return reclamations.filter((reclamation) => {
			return [
				String(reclamation.id),
				reclamation.problemType,
				reclamation.description,
				reclamation.status,
				reclamation.managerNote ?? '',
				reclamation.customer?.email ?? '',
				reclamation.customer?.name ?? '',
				reclamation.order?.productName ?? '',
				reclamation.shipment?.productName ?? '',
			].some((value) => value.toLowerCase().includes(normalizedQuery));
		});
	}, [query, reclamations]);

	async function handleSave(reclamationId: number) {
		if (!token) {
			setError('Missing auth token. Please login again.');
			return;
		}

		const draft = drafts[reclamationId];
		if (!draft) return;

		setSavingId(reclamationId);
		setError(null);

		try {
			const updated = await updateReclamation(token, reclamationId, {
				status: draft.status,
				managerNote: draft.managerNote.trim() || undefined,
			});

			setReclamations((current) => current.map((reclamation) => (reclamation.id === reclamationId ? updated : reclamation)));
			setDrafts((current) => ({
				...current,
				[reclamationId]: {
					status: updated.status,
					managerNote: updated.managerNote ?? '',
				},
			}));
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to update reclamation');
		} finally {
			setSavingId(null);
		}
	}

	if (isLoading) {
		return <div className="py-10 text-center text-sm text-[var(--muted-foreground)]">Loading reclamations...</div>;
	}

	return (
		<section className="mt-8 rounded-2xl bg-transparent">
			<div className="mb-5 flex flex-wrap items-center justify-between gap-3">
				<div>
					<h2 className="text-lg font-semibold tracking-tight">Reclamations</h2>
					<p className="mt-1 text-sm text-[var(--muted-foreground)]">{visibleReclamations.length} items</p>
				</div>
			</div>

			{error && (
				<div className="mb-4 flex items-start gap-2 rounded-md bg-[var(--tint-error)] px-3 py-2 text-sm text-[var(--color-error)]">
					<span aria-hidden="true">!</span>
					{error}
				</div>
			)}

			{visibleReclamations.length === 0 ? (
				<div className="rounded-2xl bg-[var(--card)] p-8 text-center text-sm text-[var(--muted-foreground)] shadow-sm">
					No reclamations found.
				</div>
			) : (
				<div className="grid gap-4">
					{visibleReclamations.map((reclamation) => {
						const draft = drafts[reclamation.id] ?? {
							status: reclamation.status,
							managerNote: reclamation.managerNote ?? '',
						};

						return (
							<article key={reclamation.id} className="rounded-2xl bg-[var(--card)] p-5 shadow-sm">
								<div className="mb-4 flex flex-wrap items-start justify-between gap-3">
									<div>
										<p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Reclamation #{reclamation.id}</p>
										<h3 className="mt-1 text-lg font-semibold">{getProblemTypeLabel(reclamation.problemType)}</h3>
										<p className="text-sm text-[var(--muted-foreground)]">
											{reclamation.customer?.name ?? reclamation.customer?.email ?? 'Customer'}
										</p>
									</div>
									<p className={`text-sm font-semibold ${getStatusColor(reclamation.status)}`}>{getStatusLabel(reclamation.status)}</p>
								</div>

								<div className="grid gap-4 md:grid-cols-2">
									<div className="space-y-3">
										<div>
											<p className="text-xs font-medium text-[var(--muted-foreground)]">Description</p>
											<p className="mt-1 text-sm text-[var(--foreground)]">{reclamation.description}</p>
										</div>

										{reclamation.attachmentUrl && (
											<div>
												<p className="text-xs font-medium text-[var(--muted-foreground)]">Attachment</p>
												{isImageAttachment(reclamation.attachmentUrl) ? (
													<img src={reclamation.attachmentUrl} alt="Reclamation attachment preview" className="mt-2 max-h-48 rounded-xl border border-[var(--border)] object-contain" />
												) : (
													<a href={reclamation.attachmentUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex text-sm font-medium text-[var(--role-admin)] underline-offset-4 hover:underline">
														Open attachment
													</a>
												)}
											</div>
										)}

										<div className="grid gap-3 text-sm text-[var(--muted-foreground)] sm:grid-cols-2">
											<div>
												<p className="text-xs font-medium uppercase tracking-[0.16em]">Order</p>
												<p className="mt-1">{reclamation.order ? `#${reclamation.order.id} - ${reclamation.order.productName}` : 'Not linked'}</p>
											</div>
											<div>
												<p className="text-xs font-medium uppercase tracking-[0.16em]">Shipment</p>
												<p className="mt-1">{reclamation.shipment ? `#${reclamation.shipment.id} - ${reclamation.shipment.productName}` : 'Not linked'}</p>
											</div>
										</div>
									</div>

									<div className="space-y-3 rounded-2xl bg-[var(--background)] p-4">
										<div>
											<label className="block text-xs font-medium text-[var(--muted-foreground)]">Status</label>
											<select
												value={draft.status}
												onChange={(event) =>
													setDrafts((current) => ({
														...current,
														[reclamation.id]: {
															...draft,
															status: event.target.value as ReclamationStatus,
														},
													}))
												}
												className="mt-2 w-full rounded-xl border border-[var(--input)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--ring)]"
											>
												{statusOptions.map((option) => (
													<option key={option} value={option}>{getStatusLabel(option)}</option>
												))}
											</select>
										</div>

										<div>
											<label className="block text-xs font-medium text-[var(--muted-foreground)]">Manager note</label>
											<textarea
												value={draft.managerNote}
												onChange={(event) =>
													setDrafts((current) => ({
														...current,
														[reclamation.id]: {
															...draft,
															managerNote: event.target.value,
														},
													}))
												}
												rows={4}
												className="mt-2 w-full rounded-xl border border-[var(--input)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--ring)]"
												placeholder="Add context or resolution details"
											/>
										</div>

										<button
											type="button"
											onClick={() => void handleSave(reclamation.id)}
											disabled={savingId === reclamation.id}
											className="w-full rounded-xl bg-[var(--role-admin)] px-4 py-3 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[#e6ddd1] disabled:text-[#8b857a]"
										>
											{savingId === reclamation.id ? 'Saving...' : 'Save changes'}
										</button>
									</div>
								</div>

								<div className="mt-4 border-t border-[var(--border)] pt-4 text-xs text-[var(--muted-foreground)]">Created {formatDate(reclamation.createdAt)}</div>
							</article>
						);
					})}
				</div>
			)}
		</section>
	);
}