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
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate
} from 'react-router-dom';
import { AppHeader, IngredientDetails, Modal, OrderInfo } from '@components';
import { Preloader } from '@ui';
import { FC, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from '../../services/store';
import { fetchIngredients } from '../../slices/ingredientsSlice';
import { checkUserAuth } from '../../slices/authSlice';

type RouteLocationState = {
  background?: Location;
  from?: Location;
};

const getLocationPath = (location?: Location) =>
  location ? `${location.pathname}${location.search}${location.hash}` : '/';

const AppContent: FC = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const { ingredients, isLoading, error } = useSelector(
    (state) => state.ingredients
  );
  const { user, isAuthChecked } = useSelector((state) => state.auth);

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

  const guestRedirectPath = getLocationPath(locationState?.from);

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
            !isAuthChecked ? (
              <Preloader />
            ) : user ? (
              <Navigate to={guestRedirectPath} replace />
            ) : (
              <Login />
            )
          }
        />
        <Route
          path='/register'
          element={
            !isAuthChecked ? (
              <Preloader />
            ) : user ? (
              <Navigate to={guestRedirectPath} replace />
            ) : (
              <Register />
            )
          }
        />
        <Route
          path='/forgot-password'
          element={
            !isAuthChecked ? (
              <Preloader />
            ) : user ? (
              <Navigate to={guestRedirectPath} replace />
            ) : (
              <ForgotPassword />
            )
          }
        />
        <Route
          path='/reset-password'
          element={
            !isAuthChecked ? (
              <Preloader />
            ) : user ? (
              <Navigate to={guestRedirectPath} replace />
            ) : (
              <ResetPassword />
            )
          }
        />

        <Route
          path='/profile'
          element={
            !isAuthChecked ? (
              <Preloader />
            ) : user ? (
              <Profile />
            ) : (
              <Navigate to='/login' state={{ from: location }} replace />
            )
          }
        />
        <Route
          path='/profile/orders'
          element={
            !isAuthChecked ? (
              <Preloader />
            ) : user ? (
              <ProfileOrders />
            ) : (
              <Navigate to='/login' state={{ from: location }} replace />
            )
          }
        />
        <Route
          path='/profile/orders/:number'
          element={
            !isAuthChecked ? (
              <Preloader />
            ) : user ? (
              <main className={styles.detailPageWrap}>
                <OrderInfo />
              </main>
            ) : (
              <Navigate to='/login' state={{ from: location }} replace />
            )
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
              <Modal title='Детали заказа' onClose={handleModalClose}>
                <OrderInfo />
              </Modal>
            }
          />
          <Route
            path='/profile/orders/:number'
            element={
              !isAuthChecked ? (
                <Preloader />
              ) : user ? (
                <Modal title='Детали заказа' onClose={handleModalClose}>
                  <OrderInfo />
                </Modal>
              ) : (
                <Navigate to='/login' state={{ from: location }} replace />
              )
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
