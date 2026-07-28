import { FC, SyntheticEvent, useEffect, useState } from 'react';
import { LoginUI } from '@ui-pages';

import { useDispatch, useSelector } from '../../services/store';
import { clearAuthError, loginUser } from '../../services/slices/authSlice';

export const Login: FC = () => {
  const dispatch = useDispatch();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const error = useSelector((state) => state.auth.error);

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  const handleSubmit = async (event: SyntheticEvent) => {
    event.preventDefault();

    if (!email.trim() || !password) {
      return;
    }

    try {
      await dispatch(
        loginUser({
          email: email.trim(),
          password
        })
      ).unwrap();
    } catch {}
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
