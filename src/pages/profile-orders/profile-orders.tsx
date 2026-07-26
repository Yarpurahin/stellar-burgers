import { ProfileOrdersUI } from '@ui-pages';
import { Preloader } from '@ui';
import { FC, useEffect } from 'react';
import { useDispatch, useSelector } from '../../services/store';
import { fetchUserOrders } from '../../slices/ordersSlice';

export const ProfileOrders: FC = () => {
  const dispatch = useDispatch();
  const { orders, status, error } = useSelector(
    (state) => state.orders.userOrders
  );

  useEffect(() => {
    dispatch(fetchUserOrders());
  }, [dispatch]);

  if ((status === 'idle' || status === 'loading') && !orders.length) {
    return <Preloader />;
  }

  if (status === 'failed' && !orders.length) {
    return (
      <p className='text text_type_main-medium'>
        {error || 'Не удалось загрузить историю заказов'}
      </p>
    );
  }

  return <ProfileOrdersUI orders={orders} />;
};
