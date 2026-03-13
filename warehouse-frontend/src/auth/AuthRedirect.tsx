'use client';

import { ReactNode, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { UserRole } from './auth.types';

type GuardMode = 'public-only' | 'protected';

interface AuthRedirectProps {
	children: ReactNode;
	mode: GuardMode;
	allowedRoles?: UserRole[];
	allowMissingRole?: boolean;
}

function resolveRoleRoute(role: UserRole | null): string {
	if (role === 'ADMIN') return '/admin';
	if (role === 'MANAGER') return '/manager';
	if (role === 'TECHNICIEN') return '/technicien';
	return '/pending';
}

export function AuthRedirect({
	children,
	mode,
	allowedRoles,
	allowMissingRole = false,
}: AuthRedirectProps) {
	const router = useRouter();
	const { isAuthenticated, role } = useAuth();

	const isAllowed = useMemo(() => {
		if (mode === 'public-only') {
			return !isAuthenticated;
		}

		if (!isAuthenticated) {
			return false;
		}

		if (!allowedRoles || allowedRoles.length === 0) {
			return true;
		}

		if (!role && allowMissingRole) {
			return true;
		}

		if (role && allowedRoles.includes(role)) {
			return true;
		}

		return false;
	}, [allowMissingRole, allowedRoles, isAuthenticated, mode, role]);

	useEffect(() => {
		if (isAllowed) {
			return;
		}

		if (mode === 'public-only' && isAuthenticated) {
			router.replace(resolveRoleRoute(role));
			return;
		}

		if (!isAuthenticated) {
			router.replace('/login');
			return;
		}

		router.replace(resolveRoleRoute(role));
	}, [isAllowed, isAuthenticated, mode, role, router]);

	if (!isAllowed) {
		return null;
	}

	return <>{children}</>;
}
