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

const finalStatusOptions: ReclamationStatus[] = ['RESOLVED', 'CLOSED'];
const POLL_INTERVAL_MS = 5000;

function isFinalStatus(status: ReclamationStatus): boolean {
	return status === 'RESOLVED' || status === 'CLOSED';
}

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

	async function loadReclamations(activeToken: string) {
		const data = await getAllReclamations(activeToken);
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
	}

	useEffect(() => {
		if (!token) {
			setError('Missing auth token. Please login again.');
			setIsLoading(false);
			return;
		}

		let mounted = true;
		setIsLoading(true);
		setError(null);

		void loadReclamations(token)
			.then((data) => {
				if (!mounted) return;
			})
			.catch((err: unknown) => {
				if (!mounted) return;
				setError(err instanceof Error ? err.message : 'Failed to load reclamations');
			})
			.finally(() => {
				if (!mounted) return;
				setIsLoading(false);
			});

		const pollId = window.setInterval(() => {
			void loadReclamations(token).catch((err: unknown) => {
				if (!mounted) return;
				setError(err instanceof Error ? err.message : 'Failed to load reclamations');
			});
		}, POLL_INTERVAL_MS);

		return () => {
			mounted = false;
			window.clearInterval(pollId);
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

								{isFinalStatus(reclamation.status) ? (
									<div className="grid gap-3 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4 md:grid-cols-[1.5fr_1fr_auto] md:items-center">
										<div>
											<p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--muted-foreground)]">Summary</p>
											<p className="mt-1 text-sm font-semibold text-[var(--foreground)]">{getProblemTypeLabel(reclamation.problemType)}</p>
											<p className="mt-1 text-sm text-[var(--muted-foreground)]">
												{reclamation.customer?.name ?? reclamation.customer?.email ?? 'Customer'}
											</p>
										</div>
										<div>
											<p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--muted-foreground)]">Final status</p>
											<p className={`mt-1 text-sm font-semibold ${getStatusColor(reclamation.status)}`}>{getStatusLabel(reclamation.status)}</p>
											<p className="mt-1 text-xs text-[var(--muted-foreground)]">Saved {formatDate(reclamation.updatedAt)}</p>
										</div>
										<div className="text-xs text-[var(--muted-foreground)] md:text-right">
											<p>{reclamation.managerNote || 'No manager note'}</p>
										</div>
									</div>
								) : (
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
											<label className="block text-xs font-medium text-[var(--muted-foreground)]">Final action</label>
											<div className="mt-2 flex flex-wrap gap-2">
												{finalStatusOptions.map((option) => (
													<button
														key={option}
														type="button"
														onClick={() =>
															setDrafts((current) => ({
																...current,
																[reclamation.id]: {
																	...draft,
																	status: option,
																},
															}))
														}
													className={[
														'rounded-full px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90',
														draft.status === option
															? 'bg-[var(--role-admin)] text-black'
															: 'bg-[var(--tint-info)] text-[var(--color-info)]',
													].join(' ')}
													>
														{getStatusLabel(option)}
													</button>
												))}
											</div>
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
											className="w-full rounded-xl bg-[var(--role-admin)] px-4 py-3 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
										>
											{savingId === reclamation.id ? 'Saving...' : 'Save changes'}
										</button>
									</div>
									</div>
								)}

								<div className="mt-4 border-t border-[var(--border)] pt-4 text-xs text-[var(--muted-foreground)]">Created {formatDate(reclamation.createdAt)}</div>
							</article>
						);
					})}
				</div>
			)}
		</section>
	);
}