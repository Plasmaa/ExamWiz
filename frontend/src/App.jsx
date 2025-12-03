import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import QuestionSet from './pages/QuestionSet';
import ChapterView from './pages/ChapterView';
import QuestionSetsList from './pages/QuestionSetsList';

import LandingPage from './pages/LandingPage';
import FlashcardMode from './pages/FlashcardMode';
import ExamView from './pages/ExamView';
import Layout from './components/Layout';
import { ThemeProvider } from './components/theme-provider';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <Routes>
          <Route path="/login" element={<LandingPage defaultOpenLogin={true} />} />
          <Route path="/signup" element={<LandingPage defaultOpenSignup={true} />} />
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          } />
          <Route path="/upload" element={
            <PrivateRoute>
              <Layout>
                <Upload />
              </Layout>
            </PrivateRoute>
          } />
          <Route path="/questionsets" element={
            <PrivateRoute>
              <Layout>
                <QuestionSetsList />
              </Layout>
            </PrivateRoute>
          } />
          <Route path="/questionsets/:id" element={
            <PrivateRoute>
              <Layout>
                <QuestionSet />
              </Layout>
            </PrivateRoute>
          } />
          <Route path="/chapters/:id" element={
            <PrivateRoute>
              <Layout>
                <ChapterView />
              </Layout>
            </PrivateRoute>
          } />
          <Route path="/flashcards/:id" element={
            <PrivateRoute>
              <Layout>
                <FlashcardMode />
              </Layout>
            </PrivateRoute>
          } />
          <Route path="/exam/:id" element={
            <PrivateRoute>
              <Layout>
                <ExamView />
              </Layout>
            </PrivateRoute>
          } />
          <Route path="/" element={<LandingPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
