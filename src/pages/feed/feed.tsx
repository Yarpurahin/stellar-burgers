import { Preloader } from '@ui';
import { FeedUI } from '@ui-pages';
import { FC, useEffect } from 'react';
import { useDispatch, useSelector } from '../../services/store';
import { fetchFeedOrders } from '../../services/slices/ordersSlice';

export const Feed: FC = () => {
  const dispatch = useDispatch();
  const { orders, status, error } = useSelector((state) => state.orders.feed);

  useEffect(() => {
    dispatch(fetchFeedOrders());
  }, [dispatch]);

  const handleGetFeeds = () => {
    dispatch(fetchFeedOrders());
  };

  if ((status === 'idle' || status === 'loading') && !orders.length) {
    return <Preloader />;
  }

  if (status === 'failed' && !orders.length) {
    return (
      <p className='text text_type_main-medium'>
        {error || 'Не удалось загрузить ленту заказов'}
      </p>
    );
  }

  return <FeedUI orders={orders} handleGetFeeds={handleGetFeeds} />;
};
