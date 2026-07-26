import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  getFeedsApi,
  getOrderByNumberApi,
  getOrdersApi,
  orderBurgerApi
} from '../utils/burger-api';
import { TNewOrder, TOrder } from '../utils/types';

type RequestStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

type OrdersState = {
  feed: {
    orders: TOrder[];
    total: number;
    totalToday: number;
    status: RequestStatus;
    error: string | null;
  };
  userOrders: {
    orders: TOrder[];
    status: RequestStatus;
    error: string | null;
  };
  currentOrder: {
    order: TOrder | null;
    status: RequestStatus;
    error: string | null;
  };
  createdOrder: {
    order: TNewOrder | null;
    burgerName: string;
    status: RequestStatus;
    error: string | null;
  };
};

const initialState: OrdersState = {
  feed: {
    orders: [],
    total: 0,
    totalToday: 0,
    status: 'idle',
    error: null
  },
  userOrders: {
    orders: [],
    status: 'idle',
    error: null
  },
  currentOrder: {
    order: null,
    status: 'idle',
    error: null
  },
  createdOrder: {
    order: null,
    burgerName: '',
    status: 'idle',
    error: null
  }
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message;
  }
  return 'Ошибка загрузки данных';
};

export const fetchFeedOrders = createAsyncThunk(
  'orders/fetchFeedOrders',
  async (_, { rejectWithValue }) => {
    try {
      return await getFeedsApi();
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchUserOrders = createAsyncThunk(
  'orders/fetchUserOrders',
  async (_, { rejectWithValue }) => {
    try {
      return await getOrdersApi();
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchOrderByNumber = createAsyncThunk(
  'orders/fetchOrderByNumber',
  async (number: number, { rejectWithValue }) => {
    try {
      const response = await getOrderByNumberApi(number);
      const order = response.orders[0];
      if (!order) throw new Error('Заказ не найден');
      return order;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (ingredientIds: string[], { dispatch, rejectWithValue }) => {
    try {
      const response = await orderBurgerApi(ingredientIds);
      dispatch(fetchFeedOrders());
      dispatch(fetchUserOrders());
      return response;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setCurrentOrder: (state, action: PayloadAction<TOrder>) => {
      state.currentOrder.order = action.payload;
      state.currentOrder.status = 'succeeded';
      state.currentOrder.error = null;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder.order = null;
      state.currentOrder.status = 'idle';
      state.currentOrder.error = null;
    },
    clearCreatedOrder: (state) => {
      state.createdOrder.order = null;
      state.createdOrder.burgerName = '';
      state.createdOrder.status = 'idle';
      state.createdOrder.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeedOrders.pending, (state) => {
        state.feed.status = 'loading';
        state.feed.error = null;
      })
      .addCase(fetchFeedOrders.fulfilled, (state, action) => {
        state.feed.status = 'succeeded';
        state.feed.orders = action.payload.orders;
        state.feed.total = action.payload.total;
        state.feed.totalToday = action.payload.totalToday;
      })
      .addCase(fetchFeedOrders.rejected, (state, action) => {
        state.feed.status = 'failed';
        state.feed.error =
          typeof action.payload === 'string'
            ? action.payload
            : 'Не удалось загрузить ленту заказов';
      })
      .addCase(fetchUserOrders.pending, (state) => {
        state.userOrders.status = 'loading';
        state.userOrders.error = null;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.userOrders.status = 'succeeded';
        state.userOrders.orders = action.payload;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.userOrders.status = 'failed';
        state.userOrders.error =
          typeof action.payload === 'string'
            ? action.payload
            : 'Не удалось загрузить историю заказов';
      })
      .addCase(fetchOrderByNumber.pending, (state) => {
        state.currentOrder.status = 'loading';
        state.currentOrder.error = null;
        state.currentOrder.order = null;
      })
      .addCase(fetchOrderByNumber.fulfilled, (state, action) => {
        state.currentOrder.status = 'succeeded';
        state.currentOrder.order = action.payload;
      })
      .addCase(fetchOrderByNumber.rejected, (state, action) => {
        state.currentOrder.status = 'failed';
        state.currentOrder.error =
          typeof action.payload === 'string'
            ? action.payload
            : 'Не удалось загрузить заказ';
      })
      .addCase(createOrder.pending, (state) => {
        state.createdOrder.status = 'loading';
        state.createdOrder.error = null;
        state.createdOrder.order = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.createdOrder.status = 'succeeded';
        state.createdOrder.order = action.payload.order;
        state.createdOrder.burgerName = action.payload.name;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.createdOrder.status = 'failed';
        state.createdOrder.error =
          typeof action.payload === 'string'
            ? action.payload
            : 'Не удалось оформить заказ';
      });
  }
});

export const { setCurrentOrder, clearCurrentOrder, clearCreatedOrder } =
  ordersSlice.actions;
export default ordersSlice.reducer;
