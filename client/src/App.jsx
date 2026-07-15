import { RouterProvider } from 'react-router-dom';
import { router } from './routes/index.jsx';
import { AuthProvider } from './context/AuthContext';
import { RegionProvider } from './context/RegionContext';

function App() {
  return (
    <AuthProvider>
      <RegionProvider>
        <RouterProvider router={router} />
      </RegionProvider>
    </AuthProvider>
  );
}

export default App;
