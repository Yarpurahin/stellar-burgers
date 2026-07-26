import { FC } from 'react';
import { useParams } from 'react-router-dom';
import { Preloader } from '../ui/preloader';
import { IngredientDetailsUI } from '../ui/ingredient-details';
import { useSelector } from '../../services/store';

export const IngredientDetails: FC = () => {
  const { id } = useParams<{ id: string }>();
  const { ingredients, isLoading, error } = useSelector(
    (state) => state.ingredients
  );

  const ingredientData = ingredients.find(
    (ingredient) => ingredient._id === id
  );

  if (isLoading || (!ingredients.length && !error)) return <Preloader />;

  if (error) {
    return <p className='text text_type_main-medium'>{error}</p>;
  }

  if (!ingredientData) {
    return <p className='text text_type_main-medium'>Ингредиент не найден</p>;
  }

  return <IngredientDetailsUI ingredientData={ingredientData} />;
};
