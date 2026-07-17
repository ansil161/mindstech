import { createBrowserRouter, Outlet } from 'react-router-dom';
import Layout from '../components/layout/Layout.jsx';
import Home from '../pages/user/Home';
import About from '../pages/user/About';
import Solutions from '../pages/user/Solutions';
import SolutionDetails from '../pages/user/SolutionDetails';
import Partners from '../pages/user/Partners';
import Blogs from '../pages/user/Blogs';
import Experience from '../pages/user/Experience';
import Contact from '../pages/user/Contact';
import EWaste from '../pages/user/EWaste';
import Gallery from '../pages/user/gallery/Gallery';
import Events from '../pages/user/Events';
import NotFound from '../pages/user/NotFound';
import RegionGuard from '../components/common/RegionGuard.jsx';

// Admin Imports
import AdminLogin from '../pages/admin/AdminLogin';
import AdminDashboard from '../pages/admin/AdminDashboard';
import ProtectedRoute from '../components/admin/ProtectedRoute';

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
        path: '/contact',
        element: <Contact />,
      },

      // ── Region-gated pages ──────────────────────────────────────────────
      // Only E-Waste is region-controlled. Gallery and Experience are visible
      // in all regions. To gate additional pages in future, add a RegionGuard
      // here with the matching pageKey.
      {
        element: <RegionGuard pageKey="ewaste" />,
        children: [{ path: '/ewaste', element: <EWaste /> }],
      },
      // ────────────────────────────────────────────────────────────────────

      {
        path: '/experience',
        element: <Experience />,
      },
      {
        path: '/gallery',
        element: <Gallery />,
      },
      {
        path: '/events',
        element: <Events />,
      },
    ],
  },
  {
    path: '/admin/login',
    element: <AdminLogin />,
  },
  {
    path: '/admin/dashboard',
    element: (
      <ProtectedRoute>
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

