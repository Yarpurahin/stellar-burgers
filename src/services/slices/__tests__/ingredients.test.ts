import { fetchIngredients } from '../ingredientsSlice';
import ingredientsReducer from '../ingredientsSlice';

const mockIngredients = [
  {
    _id: '1',
    name: 'Краторная булка N-200i',
    type: 'bun',
    proteins: 80,
    fat: 24,
    carbohydrates: 53,
    calories: 420,
    price: 1255,
    image: 'image',
    image_mobile: 'image_mobile',
    image_large: 'image_large'
  },
  {
    _id: '2',
    name: 'Биокотлета из марсианской Магнолии',
    type: 'main',
    proteins: 420,
    fat: 142,
    carbohydrates: 242,
    calories: 4242,
    price: 424,
    image: 'image',
    image_mobile: 'image_mobile',
    image_large: 'image_large'
  }
];

describe('ingredients reducer', () => {
  test('начальное состояние при неизвестном экшене', () => {
    const state = ingredientsReducer(undefined, {
      type: 'UNKNOWN'
    });

    expect(state).toEqual({
      ingredients: [],
      isLoading: false,
      error: null
    });
  });

  test('fetchIngredients.pending', () => {
    const state = ingredientsReducer(
      {
        ingredients: [],
        isLoading: false,
        error: 'Предыдущая ошибка'
      },
      {
        type: fetchIngredients.pending.type
      }
    );

    expect(state).toEqual({
      ingredients: [],
      isLoading: true,
      error: null
    });
  });

  test('fetchIngredients.fulfilled', () => {
    const state = ingredientsReducer(
      {
        ingredients: [],
        isLoading: true,
        error: null
      },
      {
        type: fetchIngredients.fulfilled.type,
        payload: mockIngredients
      }
    );

    expect(state).toEqual({
      ingredients: mockIngredients,
      isLoading: false,
      error: null
    });
  });

  test('fetchIngredients.rejected', () => {
    const state = ingredientsReducer(
      {
        ingredients: [],
        isLoading: true,
        error: null
      },
      {
        type: fetchIngredients.rejected.type,
        payload: 'Ошибка загрузки'
      }
    );

    expect(state).toEqual({
      ingredients: [],
      isLoading: false,
      error: 'Ошибка загрузки'
    });
  });

  test('ошибка при rejected без payload', () => {
    const state = ingredientsReducer(
      {
        ingredients: [],
        isLoading: true,
        error: null
      },
      {
        type: fetchIngredients.rejected.type
      }
    );

    expect(state).toEqual({
      ingredients: [],
      isLoading: false,
      error: 'Не удалось загрузить ингредиенты'
    });
  });
});
