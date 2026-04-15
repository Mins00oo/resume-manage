import { useEffect, type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

type Props = {
  children: ReactNode;
};

/**
 * In the redesigned preview build we allow an empty token flow: if the user
 * never logged in, we redirect to the login page — but the login page also
 * has a "Demo 체험" path that drops in a fake token so the whole app is
 * viewable without a backend.
 */
export default function ProtectedRoute({ children }: Props) {
  const token = useAuthStore((s) => s.token);
  const setToken = useAuthStore((s) => s.setToken);

  // Auto-bootstrap: first-time visitors get dropped into demo mode so they
  // don't get stuck at a blank screen. Logging out clears the token and
  // routes to /login as usual.
  useEffect(() => {
    if (!token && typeof window !== 'undefined') {
      const skipAutoDemo = sessionStorage.getItem('skipAutoDemo');
      if (!skipAutoDemo) setToken('demo-token');
    }
  }, [token, setToken]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
