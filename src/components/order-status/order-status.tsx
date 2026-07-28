import { FC } from 'react';
import { OrderStatusProps } from './type';
import { OrderStatusUI } from '@ui';

const statusText: Record<string, string> = {
  done: 'Выполнен',
  pending: 'Готовится',
  created: 'Готовится',
  cancelled: 'Отменён',
  canceled: 'Отменён'
};

export const OrderStatus: FC<OrderStatusProps> = ({ status }) => {
  let textStyle = '#F2F2F3';

  if (status === 'done') textStyle = '#00CCCC';
  if (status === 'cancelled' || status === 'canceled') textStyle = '#E52B1A';

  return (
    <OrderStatusUI textStyle={textStyle} text={statusText[status] || status} />
  );
};
