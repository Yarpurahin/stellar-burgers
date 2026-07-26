import { FC } from 'react';
import { TOrder } from '@utils-types';
import { FeedInfoUI } from '../ui/feed-info';
import { useSelector } from '../../services/store';

const getOrders = (orders: TOrder[], statuses: string[]): number[] =>
  orders
    .filter((item) => statuses.includes(item.status))
    .map((item) => item.number)
    .slice(0, 20);

export const FeedInfo: FC = () => {
  const feed = useSelector((state) => state.orders.feed);

  const readyOrders = getOrders(feed.orders, ['done']);
  const pendingOrders = getOrders(feed.orders, ['pending', 'created']);

  return (
    <FeedInfoUI
      readyOrders={readyOrders}
      pendingOrders={pendingOrders}
      feed={feed}
    />
  );
};
