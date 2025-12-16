import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, useNavigate } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ChartSkeleton } from './components/loading/ChartSkeleton';
import './styles/animations.css';

// Lazy load components for better performance
const LandingPage = lazy(() => import('./components/landing/LandingPage').then(module => ({
  default: module.LandingPage
})));

const CopilotApp = lazy(() => import('./components/CopilotApp').then(module => ({
  default: module.CopilotApp
})));

// Component for handling feature redirects
const FeatureRedirect: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  React.useEffect(() => {
    // Redirect to landing page with feature modal
    // For now, just redirect to landing page
    // In a real app, you could pass state to open the modal
    navigate('/', { state: { openFeature: id } });
  }, [id, navigate]);

  return <div>Redirecting...</div>;
};

// Enhanced Landing Page wrapper that can handle feature modals
const LandingPageWrapper: React.FC = () => {
  const navigate = useNavigate();

  const handleEnterApp = () => {
    navigate('/copilot');
  };

  return <LandingPage onEnterApp={handleEnterApp} />;
};

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* Landing page */}
          <Route path="/" element={<LandingPageWrapper />} />

          {/* Copilot app */}
          <Route path="/copilot" element={<CopilotApp />} />

          {/* Feature redirects */}
          <Route path="/feature/:id" element={<FeatureRedirect />} />

          {/* Catch all - redirect to landing */}
          <Route path="*" element={<LandingPageWrapper />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;