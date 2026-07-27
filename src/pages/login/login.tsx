import { FC, SyntheticEvent, useEffect, useState } from 'react';
import { LoginUI } from '@ui-pages';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from '../../services/store';
import { clearAuthError, loginUser } from '../../services/slices/authSlice';
import { getLocationPath, LocationState } from '../../utils/locationPath';

export const Login: FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const error = useSelector((state) => state.auth.error);

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  const handleSubmit = async (event: SyntheticEvent) => {
    event.preventDefault();

    if (!email.trim() || !password) return;

    try {
      await dispatch(loginUser({ email: email.trim(), password })).unwrap();

      const state = location.state as LocationState | null;
      navigate(getLocationPath(state?.from), { replace: true });
    } catch {
      // Ошибка отображается из state.auth.error.
    }
  };

  return (
    <LoginUI
      errorText={error ?? ''}
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      handleSubmit={handleSubmit}
    />
  );
};
