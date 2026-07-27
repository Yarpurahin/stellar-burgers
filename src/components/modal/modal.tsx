import { FC, memo, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useSelector } from '../../services/store';
import { TModalProps } from './type';
import { ModalUI } from '@ui';

const modalRoot = document.getElementById('modals');

export const Modal: FC<TModalProps> = memo(({ title, onClose, children }) => {
  const status = useSelector((state) => state.orders.currentOrder.status);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      e.key === 'Escape' && onClose();
    };

    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  if (status === 'loading') {
    return ReactDOM.createPortal(
      <ModalUI title={'loading'} onClose={onClose}>
        {children}
      </ModalUI>,
      modalRoot as HTMLDivElement
    );
  }
  return ReactDOM.createPortal(
    <ModalUI title={title} onClose={onClose}>
      {children}
    </ModalUI>,
    modalRoot as HTMLDivElement
  );
});
