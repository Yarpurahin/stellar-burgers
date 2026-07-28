import { useSelector } from '../services/store';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Preloader } from '@ui';
import { ReactNode } from 'react';

type TRouteProps = {
  children: ReactNode;
};

export const GuestRoute = ({ children }: TRouteProps) => {
  const location = useLocation();

  const { user, isAuthChecked } = useSelector((state) => state.auth);

  if (!isAuthChecked) {
    return <Preloader />;
  }

  if (!user) {
    return <Navigate to='/login' replace state={{ from: location }} />;
  }

  return <>{children}</>;
};

type TLocationState = {
  from?: Location;
};

export const ProtectedRoute = ({ children }: TRouteProps) => {
  const location = useLocation();

  const { user, isAuthChecked } = useSelector((state) => state.auth);

  if (!isAuthChecked) {
    return <Preloader />;
  }

  if (user) {
    const state = location.state as TLocationState | null;

    const from = state?.from;

    const target = from ? `${from.pathname}${from.search}${from.hash}` : '/';

    return <Navigate to={target} replace />;
  }

  return <>{children}</>;
};
