import { FC, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TConstructorIngredient } from '@utils-types';
import { BurgerConstructorUI } from '@ui';
import { useDispatch, useSelector } from '../../services/store';
import { clearCreatedOrder, createOrder } from '../../slices/ordersSlice';
import { clearConstructor } from '../../slices/constructorSlice';

export const BurgerConstructor: FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const constructorItems = useSelector((state) => state.burgerConstructor);
  const user = useSelector((state) => state.auth.user);
  const createdOrder = useSelector((state) => state.orders.createdOrder);

  const orderRequest = createdOrder.status === 'loading';
  const orderModalData = createdOrder.order;

  const onOrderClick = async () => {
    if (!constructorItems.bun || orderRequest) return;

    if (!user) {
      navigate('/login', {
        state: { from: location }
      });
      return;
    }

    const ingredientIds = [
      constructorItems.bun._id,
      ...constructorItems.ingredients.map((ingredient) => ingredient._id),
      constructorItems.bun._id
    ];

    try {
      await dispatch(createOrder(ingredientIds)).unwrap();
      dispatch(clearConstructor());
    } catch {
      // Текст ошибки хранится в state.orders.createdOrder.error.
    }
  };

  const closeOrderModal = () => {
    dispatch(clearCreatedOrder());
  };

  const price = useMemo(
    () =>
      (constructorItems.bun ? constructorItems.bun.price * 2 : 0) +
      constructorItems.ingredients.reduce(
        (sum: number, ingredient: TConstructorIngredient) =>
          sum + ingredient.price,
        0
      ),
    [constructorItems.bun, constructorItems.ingredients]
  );

  return (
    <BurgerConstructorUI
      price={price}
      orderRequest={orderRequest}
      constructorItems={constructorItems}
      orderModalData={orderModalData}
      onOrderClick={onOrderClick}
      closeOrderModal={closeOrderModal}
    />
  );
};
