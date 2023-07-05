import React from 'react';
import './App.css'; // stylesheet
import { Routes, Route } from 'react-router-dom';

import MenuBar from './components/MenuBar';

import Dashboard from './pages/Dashboard'
import Preference from './pages/Preference';
import Student from './pages/Student'
import Finance from './pages/Finance';
import Classes from './pages/Classes'
import ExpenseCategoryPage from './pages/ExpenseCategoryPage'
import IncomeCategoryPage from './pages/IncomeCategoryPage';
import FinanceChart from './pages/FinanceChart';
import Offline from './pages/Offline';
import SignUp from './pages/EBusinessCard/signup';

import TestingPage from './pages/TestingPage';
import EBusinessCard from './pages/EBusinessCard';
import Login from './pages/EBusinessCard/login';
import Card from './pages/Card';

// This is the Top Layer of the web app,
// It act as a route handler, and the links of the page is inside the MenuBar
// The <Route> inside the <Routes> switch and show the component
function App() {
  return (
    <>
      <Routes>
        <Route element={<Dashboard />} path="/" />
        <Route element={<Classes />} path="class" />
        <Route element={<Preference />} path="preference" />
        <Route element={<Student />} path="student" />
        <Route element={<Finance />} path="finance" />
        <Route element={<FinanceChart />} path="financeChart" />
        <Route element={<ExpenseCategoryPage />} path="expense_Category_Page" />
        <Route element={<IncomeCategoryPage />} path="income_Category_Page" />
        <Route element={<Offline />} path="offline" />
        <Route element={<TestingPage />} path="testingPage" />
        <Route element={<Card />} path="card/:id" />
        <Route element={<EBusinessCard />} path="ebusinessCard" />
        <Route element={<Login />} path="ebusinessCard/login" />
        <Route element={<SignUp isEdit={false} />} path="ebusinessCard/signup" />
        <Route element={<SignUp isEdit={true} />} path="ebusinessCard/update" />

      </Routes>
      <MenuBar />
    </>
  );
}

export default App;
