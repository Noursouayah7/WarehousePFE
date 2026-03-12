'use client';

import { ReactNode, useEffect, useState } from 'react';
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
	const [allowed, setAllowed] = useState(false);

	useEffect(() => {
		if (mode === 'public-only') {
			if (isAuthenticated) {
				router.replace(resolveRoleRoute(role));
				return;
			}

			setAllowed(true);
			return;
		}

		if (!isAuthenticated) {
			router.replace('/login');
			return;
		}

		if (!allowedRoles || allowedRoles.length === 0) {
			setAllowed(true);
			return;
		}

		if (!role && allowMissingRole) {
			setAllowed(true);
			return;
		}

		if (role && allowedRoles.includes(role)) {
			setAllowed(true);
			return;
		}

		router.replace(resolveRoleRoute(role));
	}, [allowMissingRole, allowedRoles, isAuthenticated, mode, role, router]);

	if (!allowed) {
		return null;
	}

	return <>{children}</>;
}
