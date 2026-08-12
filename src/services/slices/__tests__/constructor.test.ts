import {
  addIngredient,
  removeIngredient,
  moveIngredient,
  clearConstructor
} from '../constructorSlice';

import burgerConstructorReducer from '../constructorSlice';

const mockBun = {
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
};

const mockIngredient = {
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
};

describe('burgerConstructor reducer', () => {
  test('начальное состояние при неизвестном экшене', () => {
    const state = burgerConstructorReducer(undefined, {
      type: 'UNKNOWN'
    });

    expect(state).toEqual({
      bun: null,
      ingredients: []
    });
  });

  test('добавление булки', () => {
    const state = burgerConstructorReducer(undefined, addIngredient(mockBun));

    expect(state.bun).toEqual({
      ...mockBun,
      id: expect.any(String)
    });

    expect(state.ingredients).toEqual([]);
  });

  test('добавление ингредиента', () => {
    const state = burgerConstructorReducer(
      undefined,
      addIngredient(mockIngredient)
    );

    expect(state.bun).toBeNull();

    expect(state.ingredients).toHaveLength(1);

    expect(state.ingredients[0]).toEqual({
      ...mockIngredient,
      id: expect.any(String)
    });
  });

  test('удаление ингредиента', () => {
    const initialState = {
      bun: null,
      ingredients: [
        {
          ...mockIngredient,
          id: 'ingredient-1'
        },
        {
          ...mockIngredient,
          _id: '3',
          name: 'Соус Spicy-X',
          id: 'ingredient-2'
        }
      ]
    };

    const state = burgerConstructorReducer(
      initialState,
      removeIngredient('ingredient-1')
    );

    expect(state.ingredients).toHaveLength(1);

    expect(state.ingredients[0].id).toBe('ingredient-2');
  });

  test('перемещение ингредиента', () => {
    const firstIngredient = {
      ...mockIngredient,
      id: 'ingredient-1'
    };

    const secondIngredient = {
      ...mockIngredient,
      _id: '3',
      name: 'Соус Spicy-X',
      id: 'ingredient-2'
    };

    const initialState = {
      bun: null,
      ingredients: [firstIngredient, secondIngredient]
    };

    const state = burgerConstructorReducer(
      initialState,
      moveIngredient({
        fromIndex: 0,
        toIndex: 1
      })
    );

    expect(state.ingredients).toEqual([secondIngredient, firstIngredient]);
  });

  test('очищение конструктора', () => {
    const initialState = {
      bun: {
        ...mockBun,
        id: 'bun-1'
      },
      ingredients: [
        {
          ...mockIngredient,
          id: 'ingredient-1'
        }
      ]
    };

    const state = burgerConstructorReducer(initialState, clearConstructor());

    expect(state).toEqual({
      bun: null,
      ingredients: []
    });
  });
});
