import { FC } from 'react';
import { Link } from 'react-router-dom';
import styles from './app-header.module.css';
import { TAppHeaderUIProps } from './type';
import {
  BurgerIcon,
  ListIcon,
  Logo,
  ProfileIcon
} from '@zlden/react-developer-burger-ui-components';

export const AppHeaderUI: FC<TAppHeaderUIProps> = ({
  userName,
  pathname = '/'
}) => {
  const constructorActive =
    pathname === '/' || pathname.startsWith('/ingredients/');
  const feedActive = pathname === '/feed' || pathname.startsWith('/feed/');
  const profileActive = pathname.startsWith('/profile');

  return (
    <header className={styles.header}>
      <nav className={`${styles.menu} p-4`}>
        <div className={styles.menu_part_left}>
          <Link
            to='/'
            className={`${styles.link} ${
              constructorActive ? styles.link_active : ''
            }`}
          >
            <BurgerIcon type={constructorActive ? 'primary' : 'secondary'} />
            <p className='text text_type_main-default ml-2 mr-10'>
              Конструктор
            </p>
          </Link>
          <Link
            to='/feed'
            className={`${styles.link} ${feedActive ? styles.link_active : ''}`}
          >
            <ListIcon type={feedActive ? 'primary' : 'secondary'} />
            <p className='text text_type_main-default ml-2'>Лента заказов</p>
          </Link>
        </div>
        <Link to='/' className={styles.logo} aria-label='На главную'>
          <Logo className='' />
        </Link>
        <Link
          to='/profile'
          className={`${styles.link} ${styles.link_position_last} ${
            profileActive ? styles.link_active : ''
          }`}
        >
          <ProfileIcon type={profileActive ? 'primary' : 'secondary'} />
          <p className='text text_type_main-default ml-2'>
            {userName || 'Личный кабинет'}
          </p>
        </Link>
      </nav>
    </header>
  );
};
