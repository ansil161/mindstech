import { RouterProvider } from 'react-router-dom';
import { router } from './routes/index.jsx';
import { AuthProvider } from './context/AuthContext';
import { RegionProvider } from './context/RegionContext';
import SplashCursor from './components/common/SplashCursor/SplashCursor.jsx';

function App() {
  return (
    <AuthProvider>
      <RegionProvider>
        {/* Site-wide fluid cursor trail. Mounted outside RouterProvider so the
            WebGL context survives route changes instead of being torn down and
            rebuilt on every navigation. */}
        <SplashCursor
          DENSITY_DISSIPATION={1.5}
          VELOCITY_DISSIPATION={6}
          PRESSURE={0.25}
          CURL={16}
          SPLAT_RADIUS={0.17}
          SPLAT_FORCE={4500}
          COLOR_UPDATE_SPEED={20}
          RAINBOW_MODE
        />
        <RouterProvider router={router} />
      </RegionProvider>
    </AuthProvider>
  );
}

export default App;
