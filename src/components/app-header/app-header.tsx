import { FC } from 'react';
import { useLocation } from 'react-router-dom';
import { AppHeaderUI } from '@ui';
import { useSelector } from '../../services/store';

export const AppHeader: FC = () => {
  const { pathname } = useLocation();
  const userName = useSelector((state) => state.auth.user?.name);

  return <AppHeaderUI userName={userName} pathname={pathname} />;
};
