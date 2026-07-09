import { createBrowserRouter, Outlet } from 'react-router-dom';
import Layout from '../components/layout/Layout.jsx';
import Home from '../pages/Home';
import About from '../pages/About';
import Solutions from '../pages/Solutions';
import SolutionDetails from '../pages/SolutionDetails';
import Partners from '../pages/Partners';
import Blogs from '../pages/Blogs';
import Experience from '../pages/Experience';
import Contact from '../pages/Contact';
import EWaste from '../pages/EWaste';
import NotFound from '../pages/NotFound';

export const router = createBrowserRouter([
  {
    element: (
      <Layout>
        <Outlet />
      </Layout>
    ),
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/about',
        element: <About />,
      },
      {
        path: '/solutions',
        element: <Solutions />,
      },
      {
        path: '/solutions/:slug',
        element: <SolutionDetails />,
      },
      {
        path: '/partners',
        element: <Partners />,
      },
      {
        path: '/blogs',
        element: <Blogs />,
      },
      {
        path: '/experience',
        element: <Experience />,
      },
      {
        path: '/contact',
        element: <Contact />,
      },
      {
        path: '/ewaste',
        element: <EWaste />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);
