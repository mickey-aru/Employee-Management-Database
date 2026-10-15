import { useEffect, useState } from 'react';
import { fetchHierarchy, parseApiError } from '../api/employees.js';
import HierarchyNode from '../components/hierarchy/HierarchyNode.jsx';
import StatusMessage from '../components/common/StatusMessage.jsx';

export default function HierarchyPage() {
  const [roots, setRoots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadHierarchy() {
      try {
        setRoots(await fetchHierarchy());
      } catch (err) {
        setError(parseApiError(err).message);
      } finally {
        setLoading(false);
      }
    }
    loadHierarchy();
  }, []);

  function renderContent() {
    if (loading) return <StatusMessage type="loading" title="Loading hierarchy…" />;
    if (error) return <StatusMessage type="error" title="Hierarchy unavailable">{error}</StatusMessage>;
    if (roots.length === 0) {
      return <StatusMessage type="empty" title="No employees yet">Add employees to see the reporting structure.</StatusMessage>;
    }
    return (
      // This box scrolls in both directions so a big tree never stretches the page.
      <div className="tree-scroll" tabIndex={0} aria-label="Organization chart (scrollable)">
        <ul className="tree-root">
          {roots.map((root) => (
            <HierarchyNode key={root.employee_id} employee={root} />
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="page">
      <h1 className="page-title">Organization Hierarchy</h1>
      <p className="page-subtitle">Explore reporting relationships. Use the +/− buttons to collapse or expand a team.</p>
      {renderContent()}
    </div>
  );
}
