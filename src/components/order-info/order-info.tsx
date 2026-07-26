import { FC, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Preloader } from '../ui/preloader';
import { OrderInfoUI } from '../ui/order-info';
import { TIngredient } from '@utils-types';
import { useDispatch, useSelector } from '../../services/store';
import {
  clearCurrentOrder,
  fetchOrderByNumber
} from '../../slices/ordersSlice';

export const OrderInfo: FC = () => {
  const dispatch = useDispatch();
  const { number } = useParams<{ number: string }>();

  const {
    order: orderData,
    status,
    error
  } = useSelector((state) => state.orders.currentOrder);
  const ingredients = useSelector((state) => state.ingredients.ingredients);

  useEffect(() => {
    const orderNumber = Number(number);

    if (Number.isInteger(orderNumber) && orderNumber > 0) {
      dispatch(fetchOrderByNumber(orderNumber));
    }

    return () => {
      dispatch(clearCurrentOrder());
    };
  }, [dispatch, number]);

  const orderInfo = useMemo(() => {
    if (!orderData || !ingredients.length) return null;

    type TIngredientsWithCount = Record<
      string,
      TIngredient & { count: number }
    >;

    const ingredientById = new Map(
      ingredients.map((ingredient) => [ingredient._id, ingredient])
    );

    const ingredientsInfo = orderData.ingredients.reduce(
      (acc: TIngredientsWithCount, ingredientId) => {
        if (acc[ingredientId]) {
          acc[ingredientId].count += 1;
          return acc;
        }

        const ingredient = ingredientById.get(ingredientId);
        if (ingredient) {
          acc[ingredientId] = { ...ingredient, count: 1 };
        }

        return acc;
      },
      {}
    );

    const total = Object.values(ingredientsInfo).reduce(
      (sum, ingredient) => sum + ingredient.price * ingredient.count,
      0
    );

    return {
      ...orderData,
      ingredientsInfo,
      date: new Date(orderData.createdAt),
      total
    };
  }, [orderData, ingredients]);

  if (status === 'failed') {
    return (
      <p className='text text_type_main-medium'>
        {error || 'Не удалось загрузить заказ'}
      </p>
    );
  }

  if (!orderInfo) return <Preloader />;

  return <OrderInfoUI orderInfo={orderInfo} />;
};
