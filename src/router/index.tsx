
import {
    createBrowserRouter,
} from 'react-router-dom';
import IndexPage from 'src/pages/IndexPage';
import LoginPage from 'src/pages/LoginPage';
import HomePage from 'src/pages/home/HomePage';

const router = createBrowserRouter([
    {
        path: '/',
        element: <IndexPage />,
    },
    {
        path: '/login',
        element: <LoginPage />,
    },
    {
        path: '/home',
        element: <HomePage />,
    }
]);

export default router;