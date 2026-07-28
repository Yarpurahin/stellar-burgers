import {
  ConstructorPage,
  Feed,
  ForgotPassword,
  Login,
  NotFound404,
  Profile,
  ProfileOrders,
  Register,
  ResetPassword
} from '@pages';
import '../../index.css';
import styles from './app.module.css';
import {
  BrowserRouter,
  Location,
  Route,
  Routes,
  useLocation,
  useNavigate
} from 'react-router-dom';
import { AppHeader, IngredientDetails, Modal, OrderInfo } from '@components';
import { Preloader } from '@ui';
import { FC, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from '../../services/store';
import { fetchIngredients } from '../../services/slices/ingredientsSlice';
import { checkUserAuth } from '../../services/slices/authSlice';
import { GuestRoute, ProtectedRoute } from '../../utils/routes';

type RouteLocationState = {
  background?: Location;
  from?: Location;
};

const AppContent: FC = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const { ingredients, isLoading, error } = useSelector(
    (state) => state.ingredients
  );
  const locationState = location.state as RouteLocationState | null;
  const background = locationState?.background;

  useEffect(() => {
    if (!ingredients.length && !isLoading && !error) {
      dispatch(fetchIngredients());
    }
  }, [dispatch, ingredients.length, isLoading, error]);

  useEffect(() => {
    dispatch(checkUserAuth());
  }, [dispatch]);

  const handleModalClose = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const constructorPageElement =
    isLoading || (!ingredients.length && !error) ? (
      <Preloader />
    ) : error ? (
      <div className={`${styles.error} text text_type_main-medium pt-4`}>
        {error}
      </div>
    ) : (
      <ConstructorPage />
    );

  const orderNumber = String(
    useSelector((state) => state.orders.currentOrder.order?.number)
  );

  return (
    <div className={styles.app}>
      <AppHeader />

      <Routes location={background || location}>
        <Route path='/' element={constructorPageElement} />
        <Route path='/feed' element={<Feed />} />

        <Route
          path='/ingredients/:id'
          element={
            <main className={styles.detailPageWrap}>
              <h1
                className={`${styles.detailHeader} text text_type_main-large mb-6`}
              >
                Детали ингредиента
              </h1>
              <IngredientDetails />
            </main>
          }
        />

        <Route
          path='/feed/:number'
          element={
            <main className={styles.detailPageWrap}>
              <OrderInfo />
            </main>
          }
        />

        <Route
          path='/login'
          element={
            <ProtectedRoute>
              <Login />
            </ProtectedRoute>
          }
        />
        <Route
          path='/register'
          element={
            <ProtectedRoute>
              <Register />
            </ProtectedRoute>
          }
        />
        <Route
          path='/forgot-password'
          element={
            <ProtectedRoute>
              <ForgotPassword />
            </ProtectedRoute>
          }
        />
        <Route
          path='/reset-password'
          element={
            <ProtectedRoute>
              <ResetPassword />
            </ProtectedRoute>
          }
        />

        <Route
          path='/profile'
          element={
            <GuestRoute>
              <Profile />
            </GuestRoute>
          }
        />
        <Route
          path='/profile/orders'
          element={
            <GuestRoute>
              <ProfileOrders />
            </GuestRoute>
          }
        />
        <Route
          path='/profile/orders/:number'
          element={
            <GuestRoute>
              <OrderInfo />
            </GuestRoute>
          }
        />

        <Route path='*' element={<NotFound404 />} />
      </Routes>

      {background && (
        <Routes>
          <Route
            path='/ingredients/:id'
            element={
              <Modal title='Детали ингредиента' onClose={handleModalClose}>
                <IngredientDetails />
              </Modal>
            }
          />
          <Route
            path='/feed/:number'
            element={
              <Modal title={orderNumber} onClose={handleModalClose}>
                <OrderInfo />
              </Modal>
            }
          />
          <Route
            path='/profile/orders/:number'
            element={
              <GuestRoute>
                <Modal title={orderNumber} onClose={handleModalClose}>
                  <OrderInfo />
                </Modal>
              </GuestRoute>
            }
          />
        </Routes>
      )}
    </div>
  );
};

const App: FC = () => (
  <BrowserRouter>
    <AppContent />
  </BrowserRouter>
);

export default App;
