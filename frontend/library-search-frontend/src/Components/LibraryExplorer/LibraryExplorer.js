// src/Components/LibraryExplorer/LibraryExplorer.js
import React, { useEffect, useState, useMemo } from 'react';
import './LibraryExplorer.css';

import LibraryList from './LibraryList';
import LibraryDetails from '../LibraryDetails/LibraryDetails';
import {
  fetchAllLibraries,
  advancedSearchLibraries,
  fetchPopularLibraries,
} from '../../Services/MiddleWare';

function LibraryExplorer({ user }) {
  const [libraries, setLibraries] = useState([]);
  const [selectedLibrary, setSelectedLibrary] = useState(null);
  const [compareList, setCompareList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters (adapt these to match what you already have)
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [frameworkFilter, setFrameworkFilter] = useState('');
  const [sortKey, setSortKey] = useState('popularity');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    category: '',
    framework: '',
    licenseType: '',
    minStars: '',
    qualityGrade: '',
  });

  // Derived lists for controls
  const uniqueCategories = useMemo(() => {
    const s = new Set();
    libraries.forEach(lib => {
      if (lib.category) s.add(lib.category);
      if (lib.categories) {
        lib.categories.split(',').forEach(c => { const t = c.trim(); if (t) s.add(t); });
      }
    });
    return Array.from(s).sort();
  }, [libraries]);

  const uniquePlatforms = useMemo(() => {
    return Array.from(new Set(libraries.map(l => l.packageManager).filter(Boolean))).sort();
  }, [libraries]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await fetchAllLibraries();
        setLibraries(data);
      } catch (e) {
        setError(e.message || 'Failed to load libraries');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleAdvancedSearch = async (e) => {
    e && e.preventDefault && e.preventDefault();
    try {
      setLoading(true);
      setError('');
      // Call backend advanced search
      const res = await advancedSearchLibraries(advancedFilters);
      setLibraries(res);
      setShowAdvanced(false);
    } catch (err) {
      setError(err.message || 'Advanced search failed');
    } finally {
      setLoading(false);
    }
  };

  const resetAdvancedFilters = async () => {
    setAdvancedFilters({ category: '', framework: '', licenseType: '', minStars: '', qualityGrade: '' });
    setLoading(true);
    setError('');
    try {
      const data = await fetchAllLibraries();
      setLibraries(data);
    } catch (e) {
      setError(e.message || 'Failed to load libraries');
    } finally {
      setLoading(false);
    }
  };

  const filteredLibraries = useMemo(() => {
    let result = [...libraries];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (lib) =>
          lib.name.toLowerCase().includes(q) ||
          (lib.description && lib.description.toLowerCase().includes(q)) ||
          (lib.tags && lib.tags.join(' ').toLowerCase().includes(q))
      );
    }

    if (categoryFilter) {
      result = result.filter((lib) => lib.category === categoryFilter);
    }

    if (frameworkFilter) {
      result = result.filter((lib) => lib.framework === frameworkFilter);
    }

    // Simple sorting example
    if (sortKey === 'popularity') {
      result.sort(
        (a, b) => (b.githubStars || 0) - (a.githubStars || 0)
      );
    } else if (sortKey === 'recent') {
      result.sort(
        (a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated)
      );
    }

    return result;
  }, [libraries, searchQuery, categoryFilter, frameworkFilter, sortKey]);

  const toggleCompare = (lib) => {
    setCompareList((prev) => {
      const exists = prev.find((x) => x.id === lib.id);
      if (exists) return prev.filter((x) => x.id !== lib.id);
      if (prev.length >= 3) return prev; // max 3 compare
      return [...prev, lib];
    });
  };

  return (
    <>
      {/* Sidebar: optional filters (kept for additional controls) */}
      <aside className="app-sidebar">
        <div className="card" style={{ padding: '0.8rem 0.8rem' }}>
          {/* Sidebar can hold quick filters or remain empty when advanced filters used */}
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Filters</div>
        </div>

      </aside>

      {/* Main content */}
      <section className="app-content">
        {/* Top search row */}
        <div className="card top-controls">
          <div className="controls-row">
            <div className="control-group">
              <label>Sort by:</label>
              <select value={sortKey} onChange={(e) => setSortKey(e.target.value)}>
                <option value="popularity">Most Stars</option>
                <option value="recent">Recently Updated</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>

            <div className="control-group">
              <label>Category:</label>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="">All</option>
                {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div className="control-group">
              <label>Platform:</label>
              <select value={frameworkFilter} onChange={(e) => setFrameworkFilter(e.target.value)}>
                <option value="">All</option>
                {uniquePlatforms.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <input
              className="input search-input-inline"
              placeholder="Search libraries (name, tag...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <div className="controls-actions">
              <button className="advanced-toggle-btn" type="button" onClick={() => setShowAdvanced((s) => !s)}>
                {showAdvanced ? 'Hide Filters' : '▼ Show Advanced Search'}
              </button>
              <button className="reset-btn" type="button" onClick={resetAdvancedFilters}>Reset All</button>
            </div>
          </div>

          {showAdvanced && (
            <form className="advanced-search-panel" onSubmit={handleAdvancedSearch}>
              <div className="filter-group-advanced" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ minWidth: 180 }}>
                  <label>Category</label>
                  <input value={advancedFilters.category} onChange={(e) => setAdvancedFilters({...advancedFilters, category: e.target.value})} className="input" />
                </div>

                <div style={{ minWidth: 180 }}>
                  <label>Framework</label>
                  <input value={advancedFilters.framework} onChange={(e) => setAdvancedFilters({...advancedFilters, framework: e.target.value})} className="input" />
                </div>

                <div style={{ minWidth: 140 }}>
                  <label>Min Stars</label>
                  <input type="number" value={advancedFilters.minStars} onChange={(e) => setAdvancedFilters({...advancedFilters, minStars: e.target.value})} className="input" />
                </div>

                <div style={{ minWidth: 160 }}>
                  <label>Quality Grade</label>
                  <input value={advancedFilters.qualityGrade} onChange={(e) => setAdvancedFilters({...advancedFilters, qualityGrade: e.target.value})} className="input" />
                </div>
              </div>

              <div className="advanced-search-actions" style={{ marginTop: 12 }}>
                <button className="search-btn" type="submit">Search</button>
                <button type="button" className="reset-btn" onClick={resetAdvancedFilters}>Reset</button>
              </div>
            </form>
          )}

        </div>

        <div className="card">
          {loading && <div>Loading libraries...</div>}
          {error && <div style={{ color: 'salmon' }}>{error}</div>}

          {!loading && !error && (
            <LibraryList
              libraries={filteredLibraries}
              onSelect={setSelectedLibrary}
              onToggleCompare={toggleCompare}
              compareList={compareList}
            />
          )}
        </div>

        {/* Details panel (reuse existing LibraryDetails component) */}
        {selectedLibrary && (
          <div className="card">
            <LibraryDetails
              library={selectedLibrary}
              onClose={() => setSelectedLibrary(null)}
            />
          </div>
        )}
      </section>
    </>
  );
}

export default LibraryExplorer;
