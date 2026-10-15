import { Link } from 'react-router-dom';

const CARDS = [
  { to: '/employees', icon: '👥', title: 'All Employees', description: 'Browse company members and details' },
  { to: '/employees/add', icon: '➕', title: 'Add Employee', description: 'Add someone to the organization' },
  { to: '/employees/remove', icon: '🗑️', title: 'Remove Employee', description: 'Safely remove an employee' },
  { to: '/hierarchy', icon: '🌳', title: 'Organization Hierarchy', description: 'Explore reporting relationships' },
];

export default function HomePage() {
  return (
    <div className="page">
      <section className="hero">
        <h1>Employee Management System</h1>
        <p>
          Manage company employees and see how the organization is structured, from the CEO
          down to every individual contributor.
        </p>
      </section>

      <div className="card-grid">
        {CARDS.map((card) => (
          <Link key={card.to} to={card.to} className="home-card">
            <span className="home-card-icon" aria-hidden="true">{card.icon}</span>
            <h2>{card.title}</h2>
            <p>{card.description}</p>
            <span className="home-card-link">Open <span aria-hidden="true">→</span></span>
          </Link>
        ))}
      </div>
    </div>
  );
}
