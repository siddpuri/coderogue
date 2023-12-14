import { useEffect } from 'react';
import { Alert as ReactAlert } from 'react-bootstrap';

import { useAppSelector, useAppDispatch } from '../client/redux_hooks';

import { alertSlice } from '../state/alert_state';

const variants = {
    'success': 'success',
    'info': 'info',
    'error': 'danger',
};

export default function Alert() {
    const alert = useAppSelector(state => state.alert);
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (alert.isShowing) {
            let timeRemaining = alert.timeToDismiss - Date.now();
            let timeout = setTimeout(() => dispatch(alertSlice.actions.dismiss()), timeRemaining);
            return () => clearTimeout(timeout);
        }
    });

    return <>
        <div
            className="position-fixed start-0 end-0 bottom-0"
            style={{ pointerEvents: "none" }}
        >
            <ReactAlert
                variant={variants[alert.kind]}
                show={alert.isShowing}
                className="px-4 pt-1 pb-1 mb-0 rounded-0"
            >
                {alert.message}
            </ReactAlert>
        </div>
    </>;
}
