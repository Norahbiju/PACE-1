"use client";

import { BarChart3, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, LayoutDashboard, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Employee, EmployeeFilters, EmployeeListResponse, FilterCategory } from "@/lib/types";

const defaultFilters: EmployeeFilters = {
  categories: [],
  skills: [],
  ratings: [],
  locations: [],
  experience: [],
  certifications: []
};

type FilterPayload = {
  categories: FilterCategory[];
  ratingLabels: string[];
};

const listParam = (values: string[]) => values.join("|");

export function PaceProfileApp() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [filters, setFilters] = useState<EmployeeFilters>(defaultFilters);
  const [filterPayload, setFilterPayload] = useState<FilterPayload>({ categories: [], ratingLabels: [] });
  const [employees, setEmployees] = useState<EmployeeListResponse | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showReset, setShowReset] = useState(false);

  const activeFilterCount = useMemo(() => Object.values(filters).reduce((total, values) => total + values.length, 0), [filters]);

  useEffect(() => {
    fetch("/api/filters")
      .then((response) => response.json())
      .then(setFilterPayload)
      .catch(() => setFilterPayload({ categories: [], ratingLabels: [] }));
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({
      page: String(page),
      pageSize: "20"
    });

    Object.entries(filters).forEach(([key, values]) => {
      if (values.length) params.set(key, listParam(values));
    });

    setLoading(true);
    fetch(`/api/employees?${params.toString()}`, { signal: controller.signal })
      .then((response) => response.json())
      .then(setEmployees)
      .catch((error) => {
        if (error.name !== "AbortError") setEmployees(null);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [filters, page]);

  const updateFilters = (nextFilters: EmployeeFilters) => {
    setPage(1);
    setFilters(nextFilters);
  };

  const openEmployee = async (employeeId: string) => {
    const response = await fetch(`/api/employees/${employeeId}`);
    if (response.ok) {
      setSelectedEmployee(await response.json());
    }
  };

  return (
    <main className="appShell">
      <Topbar />
      <section className="contentShell">
        <aside className={`sidebar ${sidebarOpen ? "" : "collapsed"}`}>
          <button className="edgeToggle" onClick={() => setSidebarOpen((value) => !value)} aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}>
            {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
          <button className="navItem" aria-current="page">
            <LayoutDashboard size={22} />
            <span className="navLabel">Dashboard</span>
          </button>
        </aside>

        <FilterPanel
          open={filtersOpen}
          activeFilterCount={activeFilterCount}
          payload={filterPayload}
          filters={filters}
          onToggleOpen={() => setFiltersOpen((value) => !value)}
          onChange={updateFilters}
          onResetRequest={() => setShowReset(true)}
        />

        <Dashboard
          data={employees}
          loading={loading}
          page={page}
          onPageChange={setPage}
          onOpenEmployee={openEmployee}
        />
      </section>

      {selectedEmployee && <EmployeeModal employee={selectedEmployee} onClose={() => setSelectedEmployee(null)} />}
      {showReset && (
        <ConfirmReset
          onCancel={() => setShowReset(false)}
          onConfirm={() => {
            setShowReset(false);
            updateFilters(defaultFilters);
          }}
        />
      )}
    </main>
  );
}

function Topbar() {
  return (
    <header className="topbar">
      <div className="brand">
        <img className="brandMark" src="/ust-global-vector-logo-2022.svg" alt="UST" />
      </div>
      <h1 className="topbarTitle">PACE PROFILE</h1>
      <div />
    </header>
  );
}

function FilterPanel({
  open,
  activeFilterCount,
  payload,
  filters,
  onToggleOpen,
  onChange,
  onResetRequest
}: {
  open: boolean;
  activeFilterCount: number;
  payload: FilterPayload;
  filters: EmployeeFilters;
  onToggleOpen: () => void;
  onChange: (filters: EmployeeFilters) => void;
  onResetRequest: () => void;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["cloud", "scm"]));
  const [ratingExpanded, setRatingExpanded] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    setExpanded((current) => {
      const next = new Set(current);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleRatingExpanded = (id: string) => {
    setRatingExpanded((current) => {
      const next = new Set(current);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleParent = (category: FilterCategory) => {
    const optionNames = category.options.map((option) => option.name);
    const allSelected = optionNames.every((name) => {
      if (category.type === "skills") return filters.skills.includes(name);
      if (category.type === "location") return filters.locations.includes(name);
      if (category.type === "experience") return filters.experience.includes(name);
      return filters.certifications.includes(name);
    });

    const next = { ...filters };
    const key = category.type === "skills" ? "skills" : category.type === "location" ? "locations" : category.type === "experience" ? "experience" : "certifications";
    next[key] = allSelected ? next[key].filter((value) => !optionNames.includes(value)) : Array.from(new Set([...next[key], ...optionNames]));
    next.categories = category.type === "skills" && !allSelected ? Array.from(new Set([...next.categories, category.name])) : next.categories.filter((name) => name !== category.name);
    onChange(next);
  };

  const toggleOption = (category: FilterCategory, optionName: string) => {
    const key = category.type === "skills" ? "skills" : category.type === "location" ? "locations" : category.type === "experience" ? "experience" : "certifications";
    const current = filters[key];
    const nextValues = current.includes(optionName) ? current.filter((value) => value !== optionName) : [...current, optionName];
    const next = { ...filters, [key]: nextValues };

    if (category.type === "skills") {
      const hasAnyCategorySkill = category.options.some((option) => nextValues.includes(option.name));
      next.categories = hasAnyCategorySkill ? Array.from(new Set([...next.categories, category.name])) : next.categories.filter((name) => name !== category.name);
    }

    onChange(next);
  };

  const toggleRating = (rating: string) => {
    const nextRatings = filters.ratings.includes(rating) ? filters.ratings.filter((value) => value !== rating) : [...filters.ratings, rating];
    onChange({ ...filters, ratings: nextRatings });
  };

  return (
    <aside className={`filterPanel ${open ? "" : "closed"}`}>
      <button className="filterCollapse" onClick={onToggleOpen} aria-label={open ? "Collapse filters" : "Expand filters"}>
        {open ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
      </button>
      <div className="filterHeader">
        <h2>Filters</h2>
        <span className="activeBadge" title="Active filters">{activeFilterCount}</span>
      </div>
      <div className="filterBody">
        {payload.categories.map((category) => {
          const optionNames = category.options.map((option) => option.name);
          const key = category.type === "skills" ? "skills" : category.type === "location" ? "locations" : category.type === "experience" ? "experience" : "certifications";
          const selectedCount = optionNames.filter((name) => filters[key].includes(name)).length;
          const allSelected = selectedCount === optionNames.length && optionNames.length > 0;

          return (
            <section className="filterGroup" key={category.id}>
              <button className="filterGroupHeader" onClick={() => toggleExpanded(category.id)} aria-expanded={expanded.has(category.id)}>
                {expanded.has(category.id) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                <input type="checkbox" checked={allSelected} ref={(node) => { if (node) node.indeterminate = selectedCount > 0 && !allSelected; }} onChange={() => toggleParent(category)} onClick={(event) => event.stopPropagation()} />
                <span>{category.name}</span>
                {selectedCount > 0 && <span className="activeBadge">{selectedCount}</span>}
              </button>

              {expanded.has(category.id) && category.options.map((option) => {
                const selected = filters[key].includes(option.name);
                const ratingKey = `${category.id}-${option.id}`;
                return (
                  <div key={option.id}>
                    <label className="filterOption">
                      <input type="checkbox" checked={selected} onChange={() => toggleOption(category, option.name)} />
                      <span>{option.name}</span>
                      {category.type === "skills" && selected && (
                        <button type="button" className="secondaryButton" onClick={(event) => { event.preventDefault(); toggleRatingExpanded(ratingKey); }}>
                          {ratingExpanded.has(ratingKey) ? "Hide" : "Ratings"}
                        </button>
                      )}
                    </label>
                    {category.type === "skills" && selected && ratingExpanded.has(ratingKey) && (
                      <div className="ratingWrap">
                        {payload.ratingLabels.filter((rating) => rating !== "Not used").map((rating) => (
                          <label className="ratingOption" key={rating}>
                            <input type="checkbox" checked={filters.ratings.includes(rating)} onChange={() => toggleRating(rating)} />
                            <span>{rating}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </section>
          );
        })}
      </div>
      <div className="filterFooter">
        <button className="resetButton" onClick={onResetRequest}>Reset filters</button>
      </div>
    </aside>
  );
}

function Dashboard({
  data,
  loading,
  page,
  onPageChange,
  onOpenEmployee
}: {
  data: EmployeeListResponse | null;
  loading: boolean;
  page: number;
  onPageChange: (page: number) => void;
  onOpenEmployee: (employeeId: string) => void;
}) {
  return (
    <section className="dashboard">
      <div className="dashboardHeader">
        <div>
          <h2>Employee Dashboard</h2>
          <div className="dashboardMeta">{data ? `${data.total} employees found` : "Loading employees"}</div>
        </div>
        {data && <div className="dashboardMeta">Page {data.page} of {data.totalPages}</div>}
      </div>

      {loading && <div className="loading">Refreshing dashboard...</div>}
      {!loading && data && data.items.length === 0 && <div className="emptyState">No employees match the selected filters.</div>}
      {!loading && data && data.items.length > 0 && (
        <>
          <div className="tableWrap">
            <table className="employeeTable">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Location</th>
                  <th>Experience</th>
                  <th>Certifications</th>
                  <th>Skills Snapshot</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((employee) => (
                  <tr className="employeeRow" key={employee.employeeId}>
                    <td><button className="employeeName" onClick={() => onOpenEmployee(employee.employeeId)}>{employee.name}</button></td>
                    <td>{employee.role}</td>
                    <td>{employee.location}</td>
                    <td>{employee.yearsOfExperience >= 10 ? "10+" : employee.yearsOfExperience} years</td>
                    <td>
                      <div className="chipList">
                        {(employee.certifications.length ? employee.certifications : ["No certification"]).map((certification) => <span className="chip" key={certification}>{certification}</span>)}
                      </div>
                    </td>
                    <td>
                      <div className="chipList">
                        {employee.skills.filter((skill) => skill.ratingLabel !== "Not used").slice(0, 4).map((skill) => <span className="chip" key={`${employee.employeeId}-${skill.skill}`}>{skill.skill}: {skill.ratingLabel}</span>)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pagination">
            <button className="pageButton" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Previous</button>
            <span className="dashboardMeta">{data.items.length} shown of {data.total}</span>
            <button className="pageButton" disabled={page >= data.totalPages} onClick={() => onPageChange(page + 1)}>Next</button>
          </div>
        </>
      )}
    </section>
  );
}

function EmployeeModal({ employee, onClose }: { employee: Employee; onClose: () => void }) {
  const visibleSkills = employee.skills.filter((skill) => skill.ratingLabel !== "Not used");

  return (
    <div className="modalBackdrop" onClick={onClose}>
      <article className="modal" onClick={(event) => event.stopPropagation()}>
        <header className="modalHeader">
          <div>
            <h2>{employee.name}</h2>
            <div className="dashboardMeta">{employee.role}</div>
          </div>
          <button className="closeButton" onClick={onClose} aria-label="Close employee profile"><X size={20} /></button>
        </header>
        <div className="modalBody">
          <section className="detailGrid">
            <Detail label="Employee ID" value={employee.employeeId} />
            <Detail label="Email" value={employee.email} />
            <Detail label="Location" value={employee.location} />
            <Detail label="Experience" value={`${employee.yearsOfExperience >= 10 ? "10+" : employee.yearsOfExperience} years`} />
          </section>

          <section>
            <h3>Profile Summary</h3>
            <p>{employee.profileSummary}</p>
          </section>

          <section>
            <h3>Certifications</h3>
            <div className="chipList">
              {(employee.certifications.length ? employee.certifications : ["No certification"]).map((certification) => <span className="chip" key={certification}>{certification}</span>)}
            </div>
          </section>

          <section>
            <h3>Skills 360</h3>
            <div className="skillGrid">
              {visibleSkills.map((skill) => (
                <div className="skillLine" key={`${skill.category}-${skill.skill}`}>
                  <span>{skill.category} / {skill.skill}</span>
                  <strong>{skill.ratingLabel}</strong>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3>Project Experience</h3>
            <ul>
              {employee.projectExperience.map((project) => <li key={project}>{project}</li>)}
            </ul>
          </section>
        </div>
      </article>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="detailItem">
      <span className="detailLabel">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ConfirmReset({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="modalBackdrop" onClick={onCancel}>
      <div className="confirmPanel" onClick={(event) => event.stopPropagation()}>
        <h2>Reset filters?</h2>
        <p>All selected filters will be disabled and the dashboard will show all employees.</p>
        <div className="confirmActions">
          <button className="secondaryButton" onClick={onCancel}>Cancel</button>
          <button className="primaryButton" onClick={onConfirm}>Yes, reset</button>
        </div>
      </div>
    </div>
  );
}
