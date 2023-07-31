import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../redux_hooks';
import { dismiss } from '../state/alert_state';

import Alert from 'react-bootstrap/Alert';

const variants = {
    'success': 'success',
    'info': 'info',
    'error': 'danger',
};

export default function AlertPane() {
    const message = useAppSelector(state => state.alert.message);
    const kind = useAppSelector(state => state.alert.kind);
    const isShowing = useAppSelector(state => state.alert.isShowing);
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (isShowing) {
            let timeout = setTimeout(() => { dispatch(dismiss()); }, 500);
            return () => clearTimeout(timeout);
        }
    });

    return (
        <div className="position-fixed start-0 end-0 bottom-0 clickthrough">
            <Alert
                variant={variants[kind]}
                show={isShowing}
                className="px-4 pt-1 pb-1 mb-0">
                {message}
            </Alert>
        </div>
    );
}
