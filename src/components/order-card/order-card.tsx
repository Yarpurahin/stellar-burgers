import { FC, memo, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { OrderCardProps } from './type';
import { TIngredient } from '@utils-types';
import { OrderCardUI } from '../ui/order-card';
import { useSelector } from '../../services/store';

const maxIngredients = 6;

export const OrderCard: FC<OrderCardProps> = memo(({ order }) => {
  const location = useLocation();
  const ingredients = useSelector((state) => state.ingredients.ingredients);

  const orderInfo = useMemo(() => {
    if (!ingredients.length) return null;

    const ingredientById = new Map(
      ingredients.map((ingredient) => [ingredient._id, ingredient])
    );

    const ingredientsInfo = order.ingredients.reduce(
      (acc: TIngredient[], ingredientId: string) => {
        const ingredient = ingredientById.get(ingredientId);
        if (ingredient) acc.push(ingredient);
        return acc;
      },
      []
    );

    const total = ingredientsInfo.reduce(
      (sum, ingredient) => sum + ingredient.price,
      0
    );

    const ingredientsToShow = ingredientsInfo.slice(0, maxIngredients);
    const remains = Math.max(ingredientsInfo.length - maxIngredients, 0);

    return {
      ...order,
      ingredientsInfo,
      ingredientsToShow,
      remains,
      total,
      date: new Date(order.createdAt)
    };
  }, [order, ingredients]);

  if (!orderInfo) return null;

  return (
    <OrderCardUI
      orderInfo={orderInfo}
      maxIngredients={maxIngredients}
      locationState={{ background: location }}
    />
  );
});
