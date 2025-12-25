import React, { Suspense, useEffect } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { SessionProvider } from './SessionManager';
import './App.css';
import { LoginProvider } from './contexts/LoginContext';
import ProductsPage from './components/amazon/ProductsPage';
import ProductDetailPage from './components/amazon/ProductDetailPage';
import BestLocationsPage from './BestLocationsPage';
import CollectionsPage from './components/collections/CollectionsPage';
import NewTabWork from './components/newtab/NewTabWork';
import CollectionDetails from './components/collections/CollectionDetails';
import PinnedCollections from './PinnedCollections';
import PinnedBusinesses from './PinnedBusinesses';
import SharedCollectionPage from './SharedCollectionPage';
import ViewSharedCollections from './ViewSharedCollections';
import DeleteMyInfo from './DeleteMyInfo';
import BusinessListingPage from './components/BusinessListingPage';

// lazy‐loaded route components
const NearMePage        = React.lazy(() => import('./NearMePage'));
const HomePage          = React.lazy(() => import('./HomePage'));
const WebAppsPage       = React.lazy(() => import('./WebAppsPage'));
const CategoryPage      = React.lazy(() => import('./components/webapp/CategoryPage'));
const CategoryHome      = React.lazy(() => import('./CategoryHome'));
const SearchResultsPage = React.lazy(() => import('./components/5best/SearchResultsPage'));
const CityPage          = React.lazy(() => import('./CityPage'));
const ProfilePage       = React.lazy(() => import('./ProfilePage'));
const ListingPage       = React.lazy(() => import('./ListingPage'));
const LoginPage         = React.lazy(() => import('./LoginPage'));
const LogoutPage        = React.lazy(() => import('./LogoutPage'));
const LoginCheck        = React.lazy(() => import('./LoginCheck'));
const ReviewsPage       = React.lazy(() => import('./components/5best/ReviewsPage'));

const router = createBrowserRouter([
  {
    path: "/",
    element: <WebAppsPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/logout",
    element: <LogoutPage />,
  },
  {
    path: "/:subcategoryslug/:cityslug",
    element: <ListingPage />,
  },
  {
    path: "/login-check/:state/:userId",
    element: <LoginCheck />,
  },
  {
    path: "/categorypage/:cityId",
    element: <CategoryHome />,
  },
  {
    path: "/nearme",
    element: <NearMePage />,
  },
  {
    path: "/webapps",
    element: <WebAppsPage />,
  },
  {
    path: "/category/:categoryId",
    element: <CategoryPage />,
  },
  {
    path: "/cities",
    element: <CityPage />,
  },
  {
    path: "/reviews/:listingId",
    element: <ReviewsPage />,
  },
  {
    path: "/profile/:id",
    element: <ProfilePage />,
  },
  {
    path: "/amazon",
    element: <ProductsPage />,
  },
  {
    path: "/amazon/:productId",
    element: <ProductDetailPage />,
  },
  {
    path: "/subcategory/:subcategory",
    element: <BestLocationsPage />,
  },
  {
    path: "/collections",
    element: <CollectionsPage />,
  },
  {
    path: "/newtab",
    element: <NewTabWork />,
  },
  {
    path: "/collections/:id",
    element: <CollectionDetails />,
  },
  {
    path: "/pinned-collections",
    element: <PinnedCollections />,
  },
  {
    path: "/pinned-business",
    element: <PinnedBusinesses />,
  },
  {
    path: "/share-collections",
    element: <SharedCollectionPage />,
  },
  {
    path: "/view-shared-collections",
    element: <ViewSharedCollections />,
  },
  {
    path: "/delete-my-info",
    element: <DeleteMyInfo />,
  },
  {
    path: "/businesses",
    element: <BusinessListingPage />,
  }
]);

function App() {
  useEffect(() => {
    // Add favicons dynamically
    const favicons = [
      {
        rel: "icon",
        type: "image/x-icon", 
        href: "https://ind.5bestincity.com/assets/img/favicon1/favicon.ico"
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: "https://ind.5bestincity.com/assets/img/favicon1/favicon-16.png"
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "https://ind.5bestincity.com/assets/img/favicon1/favicon-32.png"
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "48x48",
        href: "https://ind.5bestincity.com/assets/img/favicon1/favicon-48.png"
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "192x192",
        href: "https://ind.5bestincity.com/assets/img/favicon1/favicon-192.png"
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "512x512",
        href: "https://ind.5bestincity.com/assets/img/favicon1/favicon-512.png"
      },
      {
        rel: "apple-touch-icon",
        href: "https://ind.5bestincity.com/assets/img/favicon1/apple-touch-icon.png"
      }
    ];

    // Remove existing favicon
    const existingFavicon = document.querySelector("link[rel='icon']");
    if (existingFavicon) {
      document.head.removeChild(existingFavicon);
    }

    // Add new favicons
    favicons.forEach(favicon => {
      const link = document.createElement('link');
      Object.keys(favicon).forEach(key => {
        link[key] = favicon[key];
      });
      document.head.appendChild(link);
    });

    // Cleanup function
    return () => {
      const links = document.querySelectorAll("link[rel*='icon'], link[rel='apple-touch-icon']");
      links.forEach(link => {
        document.head.removeChild(link);
      });
    };
  }, []);

  return (
    <LoginProvider>
      <Suspense fallback={<div style={{height: '100vh', textAlign:'center',paddingTop:50}}>Loading…</div>}>
        <CssBaseline />
        <RouterProvider router={router} />
      </Suspense>
    </LoginProvider>
  );
}

export default App;