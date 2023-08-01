
import {
    createBrowserRouter,
} from 'react-router-dom';
import IndexPage from 'src/pages/IndexPage';
import LoginPage from 'src/pages/LoginPage';

const router = createBrowserRouter([
    {
        path: '/',
        element: <IndexPage />,
    },
    {
        path: '/login',
        element: <LoginPage />,
    }
]);

export default router;