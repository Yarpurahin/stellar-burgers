import { useSelector } from '../services/store';
import { Navigate, useNavigate } from 'react-router-dom';
import { Preloader } from '@ui';
import { ReactNode } from 'react';

type TRouteProps = {
  children: ReactNode;
};

export const GuestRoute = ({ children }: TRouteProps) => {
  const { user } = useSelector((state) => state.auth);
  const isLoading = useSelector((state) => state.auth.isLoading);

  if (!user) {
    return <Navigate to='/login' replace />;
  }

  if (isLoading) {
    return <Preloader />;
  }

  return <>{children}</>;
};

export const ProtectedRoute = ({ children }: TRouteProps) => {
  const { user } = useSelector((state) => state.auth);
  const isLoading = useSelector((state) => state.auth.isLoading);
  const navigate = useNavigate();

  if (user) {
    navigate(-1);
  }

  if (isLoading) {
    return <Preloader />;
  }

  return <>{children}</>;
};
