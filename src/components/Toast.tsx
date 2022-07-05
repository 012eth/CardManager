import { toast as toastify, ToastContainer as ToastifyContainer, ToastOptions } from 'react-toastify';

const position: ToastOptions['position'] = 'top-left';

export const ToastContainer = () => (
    <ToastifyContainer
        position={position}
        hideProgressBar={false}
        newestOnTop={false}
        autoClose={1500}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
    />
);

export const toast = {
    error: (message: string, options?: ToastOptions<{}>) =>
        toastify.error(message, {
            position,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            ...options,
        }),
    success: (message: string, options?: ToastOptions<{}>) =>
        toastify.success(message, {
            position,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            ...options,
        }),
};
