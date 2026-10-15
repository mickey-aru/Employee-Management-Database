import { useState } from 'react';

const DEPTH_COLOR_COUNT = 6;

// Renders one employee card and, recursively, a HierarchyNode for every child.
// There is no hardcoded CEO/VP/Manager logic: depth is just a number that grows as we go down.
export default function HierarchyNode({ employee, depth = 0 }) {
  const [expanded, setExpanded] = useState(true);

  const childCount = employee.children.length;
  const hasChildren = childCount > 0;

  return (
    <li className="tree-item">
      <div className={`tree-card depth-${depth % DEPTH_COLOR_COUNT}`}>
        <div className="tree-card-text">
          <span className="tree-role">{employee.role}</span>
          <span className="tree-name">{employee.name}</span>
          <span className="tree-id">{employee.employee_id}</span>
        </div>

        {hasChildren && (
          <button
            type="button"
            className="tree-toggle"
            aria-expanded={expanded}
            aria-label={`${expanded ? 'Collapse' : 'Expand'} ${employee.name}'s team`}
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? '−' : '+'} {childCount}
          </button>
        )}
      </div>

      {hasChildren && expanded && (
        <ul className="tree-children">
          {employee.children.map((child) => (
            <HierarchyNode key={child.employee_id} employee={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}
