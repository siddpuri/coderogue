import { useEffect } from 'react';
import Alert from 'react-bootstrap/Alert';
import { useAppSelector, useAppDispatch } from '../redux_hooks';

import { alertSlice } from '../state/alert_state';

const variants = {
    'success': 'success',
    'info': 'info',
    'error': 'danger',
};

export default function AlertPane() {
    const alert = useAppSelector(state => state.alert);
    const actions = alertSlice.actions;
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (alert.isShowing) {
            let timeout = setTimeout(() => { dispatch(actions.dismiss()); }, 500);
            return () => clearTimeout(timeout);
        }
    });

    return (
        <div className="position-fixed start-0 end-0 bottom-0 clickthrough">
            <Alert
                variant={variants[alert.kind]}
                show={alert.isShowing}
                className="px-4 pt-1 pb-1 mb-0">
                {alert.message}
            </Alert>
        </div>
    );
}