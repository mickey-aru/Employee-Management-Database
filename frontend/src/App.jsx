import { Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/layout/Navbar.jsx';
import HomePage from './pages/HomePage.jsx';
import EmployeesPage from './pages/EmployeesPage.jsx';
import AddEmployeePage from './pages/AddEmployeePage.jsx';
import RemoveEmployeePage from './pages/RemoveEmployeePage.jsx';
import HierarchyPage from './pages/HierarchyPage.jsx';

function NotFoundPage() {
  return (
    <div className="page">
      <h1 className="page-title">Page not found</h1>
      <p className="page-subtitle">
        That page does not exist. <Link to="/">Go back home</Link>.
      </p>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/employees/add" element={<AddEmployeePage />} />
          <Route path="/employees/remove" element={<RemoveEmployeePage />} />
          <Route path="/hierarchy" element={<HierarchyPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </>
  );
}
