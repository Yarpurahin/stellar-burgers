import { ProfileUI } from '@ui-pages';
import { ChangeEvent, FC, SyntheticEvent, useEffect, useState } from 'react';
import { useDispatch, useSelector } from '../../services/store';
import { clearUpdateUserError, updateUser } from '../../slices/authSlice';
import { TRegisterData } from '../../utils/types';

export const Profile: FC = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const updateUserError = useSelector((state) => state.auth.updateUserError);

  const [formValue, setFormValue] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: ''
  });

  useEffect(() => {
    setFormValue({
      name: user?.name || '',
      email: user?.email || '',
      password: ''
    });
  }, [user]);

  useEffect(() => {
    dispatch(clearUpdateUserError());
  }, [dispatch]);

  const isFormChanged =
    formValue.name !== (user?.name || '') ||
    formValue.email !== (user?.email || '') ||
    Boolean(formValue.password);

  const handleSubmit = async (event: SyntheticEvent) => {
    event.preventDefault();
    if (!user || !isFormChanged) return;

    const changedData: Partial<TRegisterData> = {};

    if (formValue.name !== user.name) {
      changedData.name = formValue.name.trim();
    }
    if (formValue.email !== user.email) {
      changedData.email = formValue.email.trim();
    }
    if (formValue.password) {
      changedData.password = formValue.password;
    }

    try {
      await dispatch(updateUser(changedData)).unwrap();
      setFormValue((current) => ({ ...current, password: '' }));
    } catch {
      // Ошибка отображается в ProfileUI.
    }
  };

  const handleCancel = (event: SyntheticEvent) => {
    event.preventDefault();
    dispatch(clearUpdateUserError());
    setFormValue({
      name: user?.name || '',
      email: user?.email || '',
      password: ''
    });
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    dispatch(clearUpdateUserError());
    setFormValue((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  };

  return (
    <ProfileUI
      formValue={formValue}
      isFormChanged={isFormChanged}
      updateUserError={updateUserError ?? undefined}
      handleCancel={handleCancel}
      handleSubmit={handleSubmit}
      handleInputChange={handleInputChange}
    />
  );
};
