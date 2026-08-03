import { createBrowserRouter, Outlet } from 'react-router-dom';
import Layout from '../components/layout/Layout.jsx';
import Home from '../pages/user/Home';
import RegionGuard from '../components/common/RegionGuard.jsx';
import ProtectedRoute from '../components/admin/ProtectedRoute';
import RouteFallback from './RouteFallback.jsx';

/**
 * Route-level code splitting.
 *
 * Every page except Home is behind a `lazy()` route so its JS is fetched on
 * navigation instead of shipping in the initial bundle. Before this, the entry
 * chunk carried every user page AND the whole admin dashboard (~270 kB of
 * pages/admin + components/admin), so a visitor reading a blog post downloaded
 * the CMS they can never open.
 *
 * Home stays EAGER on purpose: it is the landing route, and making it lazy adds
 * a fetch waterfall between the entry chunk and first paint — the one place
 * where splitting costs more than it saves.
 *
 * `lazy` returns { Component } (React Router 7's contract), NOT React.lazy. The
 * router awaits it as part of navigation, so RouteTransition's overlay is
 * already covering the screen while the chunk downloads and there is no flash.
 */
const page = (loader) => async () => ({ Component: (await loader()).default });

export const router = createBrowserRouter([
  {
    element: (
      <Layout>
        <Outlet />
      </Layout>
    ),
    // Shown on a hard refresh directly onto a lazy route, while its chunk
    // downloads. In-app navigations never reach this — the router resolves lazy
    // before swapping, under the RouteTransition overlay.
    hydrateFallbackElement: <RouteFallback />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/about',
        lazy: page(() => import('../pages/user/About')),
      },
      {
        path: '/solutions',
        lazy: page(() => import('../pages/user/Solutions')),
      },
      {
        path: '/solutions/:slug',
        lazy: page(() => import('../pages/user/SolutionDetails')),
      },
      // Products: `/products/category/:category` is declared before the brand
      // route so the literal segment wins; React Router ranks static segments
      // above dynamic ones, but the order also documents the intent.
      {
        path: '/products',
        lazy: page(() => import('../pages/user/Products')),
      },
      {
        path: '/products/category/:category',
        lazy: page(() => import('../pages/user/Products')),
      },
      {
        path: '/products/:brand',
        lazy: page(() => import('../pages/user/ProductBrand')),
      },
      {
        path: '/partners',
        lazy: page(() => import('../pages/user/Partners')),
      },
      {
        path: '/projects',
        lazy: page(() => import('../pages/user/Projects')),
      },
      {
        path: '/blogs',
        lazy: page(() => import('../pages/user/Blogs')),
      },
      {
        path: '/contact',
        lazy: page(() => import('../pages/user/Contact')),
      },

      // ── Region-gated pages ──────────────────────────────────────────────
      // Only E-Waste is region-controlled. Gallery and Experience are visible
      // in all regions. To gate additional pages in future, add a RegionGuard
      // here with the matching pageKey.
      {
        element: <RegionGuard pageKey="ewaste" />,
        children: [
          {
            path: '/ewaste',
            lazy: page(() => import('../pages/user/EWaste')),
          },
        ],
      },
      // ────────────────────────────────────────────────────────────────────

      {
        path: '/experience',
        lazy: page(() => import('../pages/user/Experience')),
      },
      {
        path: '/gallery',
        lazy: page(() => import('../pages/user/gallery/Gallery')),
      },
      {
        path: '/events',
        lazy: page(() => import('../pages/user/Events')),
      },
    ],
  },
  {
    path: '/admin/login',
    lazy: page(() => import('../pages/admin/AdminLogin')),
    hydrateFallbackElement: <RouteFallback />,
  },
  {
    // ProtectedRoute stays eager and wraps an <Outlet/> so the auth check runs
    // before the dashboard chunk is requested — an unauthenticated visitor is
    // redirected to /admin/login without ever downloading the CMS.
    path: '/admin/dashboard',
    element: (
      <ProtectedRoute>
        <Outlet />
      </ProtectedRoute>
    ),
    hydrateFallbackElement: <RouteFallback />,
    children: [
      {
        index: true,
        lazy: page(() => import('../pages/admin/AdminDashboard')),
      },
    ],
  },
  {
    path: '*',
    lazy: page(() => import('../pages/user/NotFound')),
    hydrateFallbackElement: <RouteFallback />,
  },
]);
