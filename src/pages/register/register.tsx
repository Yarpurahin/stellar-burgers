import { FC, SyntheticEvent, useEffect, useState } from 'react';
import { RegisterUI } from '@ui-pages';
import { Location, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from '../../services/store';
import { clearAuthError, registerUser } from '../../slices/authSlice';

type LocationState = {
  from?: Location;
};

const getLocationPath = (location?: Location) =>
  location ? `${location.pathname}${location.search}${location.hash}` : '/';

export const Register: FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const error = useSelector((state) => state.auth.error);

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  const handleSubmit = async (event: SyntheticEvent) => {
    event.preventDefault();

    if (!userName.trim() || !email.trim() || !password) return;

    try {
      await dispatch(
        registerUser({
          name: userName.trim(),
          email: email.trim(),
          password
        })
      ).unwrap();

      const state = location.state as LocationState | null;
      navigate(getLocationPath(state?.from), { replace: true });
    } catch {
      // Ошибка отображается из state.auth.error.
    }
  };

  return (
    <RegisterUI
      errorText={error ?? ''}
      email={email}
      userName={userName}
      password={password}
      setEmail={setEmail}
      setPassword={setPassword}
      setUserName={setUserName}
      handleSubmit={handleSubmit}
    />
  );
};
