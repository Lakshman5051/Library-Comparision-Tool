import React, { useRef } from 'react';
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LabelList } from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './ComparisonView.css';

function ComparisonView({ libraries, onClose, onRemoveLibrary }) {
  const chartsRef = useRef(null);

  const colors = ['#667eea', '#f56565', '#48bb78', '#ed8936', '#9f7aea', '#38b2ac'];

  const metricMeta = [
    { key: 'popularityScore', label: 'Popularity', description: 'Usage levels and general adoption.', useCase: 'Select when broad adoption is important.' },
    { key: 'maintenanceScore', label: 'Maintenance', description: 'Update frequency and issue handling.', useCase: 'Select when regular updates are required.' },
    { key: 'securityScore', label: 'Security', description: 'Known issues and patch history.', useCase: 'Select when avoiding vulnerabilities is essential.' },
    { key: 'communityScore', label: 'Community', description: 'Contributor activity and engagement.', useCase: 'Select when active contributor engagement is useful.' },
    { key: 'qualityScore', label: 'Quality', description: 'Documentation clarity and stability indicators.', useCase: 'Select when consistent behavior and clarity are priorities.' },
  ];

  const gradeLegend = [
    { grade: 'A', text: 'Strong performance across most dimensions.' },
    { grade: 'B', text: 'Good overall performance; minor gaps possible.' },
    { grade: 'C', text: 'Adequate but may require review for specific needs.' },
    { grade: 'D', text: 'Limited strength in key areas; use with caution.' },
    { grade: 'F', text: 'Weak performance; not recommended.' },
  ];

  const pieChartData = (library) => [
    { name: 'Popularity', value: library.popularityScore || 0, fill: '#667eea' },
    { name: 'Maintenance', value: library.maintenanceScore || 0, fill: '#f56565' },
    { name: 'Security', value: library.securityScore || 0, fill: '#48bb78' },
    { name: 'Community', value: library.communityScore || 0, fill: '#ed8936' },
    { name: 'Quality', value: library.qualityScore || 0, fill: '#9f7aea' },
  ];

  const getOverallScore = (library) => {
    if (library.overallScore !== null && library.overallScore !== undefined) {
      return library.overallScore.toFixed(1);
    }
    return calculateFallbackScore(library);
  };

  const calculateFallbackScore = (library) => {
    let score = 0;
    let factors = 0;

    if (library.popularityScore !== null && library.popularityScore !== undefined) {
      score += library.popularityScore;
      factors++;
    }
    if (library.maintenanceScore !== null && library.maintenanceScore !== undefined) {
      score += library.maintenanceScore;
      factors++;
    }
    if (library.securityScore !== null && library.securityScore !== undefined) {
      score += library.securityScore;
      factors++;
    }
    if (library.communityScore !== null && library.communityScore !== undefined) {
      score += library.communityScore;
      factors++;
    }
    if (library.qualityScore !== null && library.qualityScore !== undefined) {
      score += library.qualityScore;
      factors++;
    }

    return factors > 0 ? (score / factors).toFixed(1) : '0.0';
  };

  const getStrengths = (library) => {
    const scored = metricMeta
      .map((m) => ({ ...m, value: library[m.key] }))
      .filter((m) => m.value !== null && m.value !== undefined);
    return scored
      .sort((a, b) => b.value - a.value)
      .slice(0, 2)
      .map((m) => `${m.label} ${m.value.toFixed(1)}`);
  };

  const getWatchouts = (library) => {
    const scored = metricMeta
      .map((m) => ({ ...m, value: library[m.key] }))
      .filter((m) => m.value !== null && m.value !== undefined);
    if (scored.length === 0) return [];
    return scored
      .sort((a, b) => a.value - b.value)
      .slice(0, 1)
      .map((m) => `${m.label} ${m.value.toFixed(1)}`);
  };

  const formatNumber = (num) => {
    if (!num || num === 0) return 'N/A';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num?.toLocaleString();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const formatSupportedOS = (supportedOs) => {
    if (!supportedOs || supportedOs.length === 0) return 'Not specified';
    if (supportedOs.length <= 3) return supportedOs.join(', ');
    return `${supportedOs.slice(0, 3).join(', ')} +${supportedOs.length - 3} more`;
  };

  const scores = libraries.map((lib) => parseFloat(getOverallScore(lib)));
  const maxScore = Math.max(...scores);
  const isSingleColumn = libraries.length >= 3;

  const exportChartsAsPNG = async () => {
    if (!chartsRef.current) return;
    
    try {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      const canvas = await html2canvas(chartsRef.current, {
        backgroundColor: currentTheme === 'dark' ? '#0f172a' : '#ffffff',
        scale: 3, // higher scale for presentation clarity
        logging: false,
        useCORS: true
      });
      
      const link = document.createElement('a');
      link.download = `library-comparison-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error exporting PNG:', error);
      alert('Failed to export charts as PNG. Please try again.');
    }
  };

  const exportChartsAsPDF = async () => {
    if (!chartsRef.current) return;
    
    try {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      const canvas = await html2canvas(chartsRef.current, {
        backgroundColor: currentTheme === 'dark' ? '#0f172a' : '#ffffff',
        scale: 3, // higher scale for sharper PDF output
        logging: false,
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      // Create a PDF sized to the capture to maximize clarity
      const pdf = new jsPDF('portrait', 'pt', [canvas.width, canvas.height]);
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`library-comparison-${Date.now()}.pdf`);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export charts as PDF. Please try again.');
    }
  };

  return (
    <div className="comparison-view-fullscreen">
      <div className="comparison-header-fullscreen">
        <div className="header-content">
          <h1>From APIs to Architecture: Library Comparison Guide</h1>
          {/* <p className="comparison-subtitle">
            Technical evaluation of design patterns, extensibility, and compatibility with modern stacks.
          </p>*/}
        </div>
        <div className="header-actions">
          <button className="export-btn export-png" onClick={exportChartsAsPNG}>
            Export PNG
          </button>
          <button className="export-btn export-pdf" onClick={exportChartsAsPDF}>
            Export PDF
          </button>
          <button className="close-btn-fullscreen" onClick={onClose} aria-label="Close comparison">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="comparison-content-fullscreen" ref={chartsRef}>
        <div className={`comparison-layout ${isSingleColumn ? 'single-column' : ''}`}>
          <div className="comparison-main">
            <section className="scorecard-section-fullscreen">
              <h2 className="section-title">Detailed Library Information</h2>
              <div className="scorecard-grid">
                {libraries.map((library, idx) => {
                  const overallScore = getOverallScore(library);
                  const isTopScore = parseFloat(overallScore) === maxScore && libraries.length > 1;

                  return (
                    <div
                      key={library.id}
                      className="library-scorecard-fullscreen"
                      style={{ borderTopColor: colors[idx % colors.length] }}
                    >
                      <div className="scorecard-header-fullscreen">
                        <div className="library-heading">
                          <h3 className="library-title" title={library.name}>{library.name}</h3>
                          <p className="library-category">{library.categories || 'General'}</p>
                        </div>
                        <button
                          className="remove-library-btn"
                          onClick={() => onRemoveLibrary(library.id)}
                          aria-label={`Remove ${library.name}`}
                          title="Remove from comparison"
                        >
                          ✕
                        </button>
                            </div>

                                          <div className="overall-score-fullscreen">
                                            <div className="score-circle-fullscreen" style={{ borderColor: colors[idx % colors.length] }}>
                                              <span className="score-value-fullscreen">{overallScore}</span>
                                              <span className="score-max-fullscreen">/10</span>
                                            </div>
                                            <div className="score-details-fullscreen">
                                              <div className="quality-badge-fullscreen" data-grade={library.qualityGrade}>
                                                Grade: {library.qualityGrade || 'N/A'}
                                              </div>
                          {isTopScore && <div className="top-score-badge-fullscreen">🏆 Top Score</div>}
                                            </div>
                                            <div className="score-insights">
                                              {getStrengths(library).length > 0 && (
                                                <div className="insight-row">
                                                  <span className="insight-label">Strengths</span>
                                                  <span className="insight-value">{getStrengths(library).join(', ')}</span>
                                                </div>
                                              )}
                                              {getWatchouts(library).length > 0 && (
                                                <div className="insight-row">
                                                  <span className="insight-label">Watch</span>
                                                  <span className="insight-value">{getWatchouts(library).join(', ')}</span>
                                                </div>
                                              )}
                                            </div>

                        {(library.popularityScore !== undefined ||
                          library.maintenanceScore !== undefined ||
                          library.securityScore !== undefined ||
                          library.communityScore !== undefined ||
                          library.qualityScore !== undefined) && (
                                              <div className="score-breakdown-fullscreen">
                                                {library.popularityScore !== undefined && (
                                                  <div className="score-breakdown-item-fullscreen">
                                                    <span className="breakdown-label-fullscreen">Popularity:</span>
                                                    <span className="breakdown-value-fullscreen">{library.popularityScore.toFixed(1)}</span>
                                                  </div>
                                                )}
                                                {library.maintenanceScore !== undefined && (
                                                  <div className="score-breakdown-item-fullscreen">
                                                    <span className="breakdown-label-fullscreen">Maintenance:</span>
                                                    <span className="breakdown-value-fullscreen">{library.maintenanceScore.toFixed(1)}</span>
                                                  </div>
                                                )}
                                                {library.securityScore !== undefined && (
                                                  <div className="score-breakdown-item-fullscreen">
                                                    <span className="breakdown-label-fullscreen">Security:</span>
                                                    <span className="breakdown-value-fullscreen">{library.securityScore.toFixed(1)}</span>
                                                  </div>
                                                )}
                                                {library.communityScore !== undefined && (
                                                  <div className="score-breakdown-item-fullscreen">
                                                    <span className="breakdown-label-fullscreen">Community:</span>
                                                    <span className="breakdown-value-fullscreen">{library.communityScore.toFixed(1)}</span>
                                                  </div>
                                                )}
                                                {library.qualityScore !== undefined && (
                                                  <div className="score-breakdown-item-fullscreen">
                                                    <span className="breakdown-label-fullscreen">Quality:</span>
                                                    <span className="breakdown-value-fullscreen">{library.qualityScore.toFixed(1)}</span>
                                                  </div>
                                                )}
                                              </div>
                                            )}
                                          </div>

                                          {library.description && (
                                            <p className="library-description-fullscreen">
                                              {library.description}
                                            </p>
                                          )}

                                          <div className="metrics-grid-fullscreen">
                                            <div className="metric-item-fullscreen">
                                              <span className="metric-icon-fullscreen">⭐</span>
                                              <div className="metric-content-fullscreen">
                                                <span className="metric-label-fullscreen">GitHub Stars</span>
                                                <span className="metric-value-fullscreen">{formatNumber(library.githubStars)}</span>
                                              </div>
                                            </div>
                                            <div className="metric-item-fullscreen">
                                              <span className="metric-icon-fullscreen">👥</span>
                                              <div className="metric-content-fullscreen">
                                                <span className="metric-label-fullscreen">Used By</span>
                                                <span className="metric-value-fullscreen">{formatNumber(library.dependentProjectsCount)} projects</span>
                                              </div>
                                            </div>
                                            <div className="metric-item-fullscreen">
                                              <span className="metric-icon-fullscreen">🔧</span>
                                              <div className="metric-content-fullscreen">
                                                <span className="metric-label-fullscreen">Forks</span>
                                                <span className="metric-value-fullscreen">{formatNumber(library.githubForks)}</span>
                                              </div>
                                            </div>
                                            <div className="metric-item-fullscreen">
                                              <span className="metric-icon-fullscreen">💻</span>
                                              <div className="metric-content-fullscreen">
                                                <span className="metric-label-fullscreen">Supported OS</span>
                                                <span className="metric-value-fullscreen">{formatSupportedOS(library.supportedOs)}</span>
                                              </div>
                                            </div>
                                            <div className="metric-item-fullscreen">
                                              <span className="metric-icon-fullscreen">🕒</span>
                                              <div className="metric-content-fullscreen">
                                                <span className="metric-label-fullscreen">Last Commit</span>
                                                <span className="metric-value-fullscreen">{formatDate(library.lastRepositoryReleaseDate)}</span>
                                              </div>
                                            </div>
                                            <div className="metric-item-fullscreen">
                                              <span className="metric-icon-fullscreen">🔒</span>
                                              <div className="metric-content-fullscreen">
                                                <span className="metric-label-fullscreen">Security</span>
                                                <span className={`metric-value-fullscreen ${library.hasSecurityVulnerabilities ? 'warning' : 'success'}`}>
                                                  {library.hasSecurityVulnerabilities 
                                                    ? (library.vulnerabilityCount > 0 
                                                        ? `⚠️ ${library.vulnerabilityCount} Vulnerabilit${library.vulnerabilityCount === 1 ? 'y' : 'ies'}`
                                                        : '⚠️ Issues Found')
                                                    : '✅ No Issues'}
                                                </span>
                                              </div>
                                            </div>
                                            <div className="metric-item-fullscreen">
                                              <span className="metric-icon-fullscreen">📄</span>
                                              <div className="metric-content-fullscreen">
                                                <span className="metric-label-fullscreen">License</span>
                                                <span className="metric-value-fullscreen">{library.licenseType || 'Not specified'}</span>
                                              </div>
                                            </div>
                                            <div className="metric-item-fullscreen">
                                              <span className="metric-icon-fullscreen">📌</span>
                                              <div className="metric-content-fullscreen">
                                                <span className="metric-label-fullscreen">Latest Version</span>
                                                <span className="metric-value-fullscreen">{library.latestVersion || 'N/A'}</span>
                                              </div>
                                            </div>
                                            {library.isDeprecated && (
                                              <div className="metric-item-fullscreen deprecated-warning-fullscreen">
                                                <span className="metric-icon-fullscreen">⚠️</span>
                                                <div className="metric-content-fullscreen">
                                                  <span className="metric-label-fullscreen">Status</span>
                                                  <span className="metric-value-fullscreen warning">Deprecated</span>
                                                </div>
                                              </div>
                                            )}
                                          </div>

                      {(library.homepageUrl || library.repositoryUrl) && (
                        <div className="library-links-fullscreen">
                          {library.homepageUrl && (
                            <a href={library.homepageUrl} target="_blank" rel="noopener noreferrer" className="lib-link-fullscreen">
                              🌐 Homepage
                            </a>
                          )}
                          {library.repositoryUrl && (
                            <a href={library.repositoryUrl} target="_blank" rel="noopener noreferrer" className="lib-link-fullscreen">
                              💻 Repository
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="chart-container pie-section">
              <h3 className="chart-title">Score Composition (0–10 per dimension)</h3>
              <div className="pie-grid">
                {libraries.map((library, idx) => {
                  const chartData = pieChartData(library).map((entry) => ({
                    ...entry,
                    value: Number.isFinite(entry.value) ? entry.value : 0,
                  }));

                  return (
                  <div key={library.id} className="pie-card">
                    <div className="pie-title">
                      <span className="dot" style={{ background: colors[idx % colors.length] }}></span>
                        <span className="pie-title-text" title={library.name}>{library.name}</span>
                    </div>
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie
                            data={chartData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={52}
                          outerRadius={88}
                          paddingAngle={2}
                          startAngle={90}
                          endAngle={-270}
                            labelLine
                            label={false}
                        >
                            {chartData.map((entry, i) => (
                            <Cell key={`cell-${i}`} fill={entry.fill} />
                          ))}
                            <LabelList
                              dataKey="value"
                              position="outside"
                              formatter={(val, entry) => {
                                const label = entry?.name || 'Metric';
                                const safeVal = Number.isFinite(val) ? val.toFixed(1) : '0.0';
                                return `${label} ${safeVal}`;
                              }}
                              style={{ fontSize: 12, fill: '#334155' }}
                            />
                        </Pie>
                        <Legend />
                        <Tooltip
                          formatter={(value, name) => [`${value.toFixed(1)}/10`, name]}
                          contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  );
                })}
              </div>
            </section>

          <section className="chart-container matrix-section">
            <h3 className="chart-title">Side-by-Side Evaluation</h3>
            <div className="matrix-scroll">
            <div className="comparison-matrix">
              <div className="matrix-header">
                <div className="matrix-cell matrix-label"></div>
                {libraries.map((lib, idx) => (
                  <div key={lib.id} className="matrix-cell matrix-title">
                    <span className="dot" style={{ background: colors[idx % colors.length] }}></span>
                    <span className="matrix-title-text" title={lib.name}>{lib.name}</span>
                  </div>
                ))}
              </div>

              {metricMeta.map((metric) => (
                <div key={metric.key} className="matrix-row">
                  <div className="matrix-cell matrix-label">
                    <div className="matrix-label-title">{metric.label}</div>
                    <div className="matrix-label-sub">{metric.description}</div>
                  </div>
                  {libraries.map((lib, idx) => (
                    <div key={`${lib.id}-${metric.key}`} className="matrix-cell">
                      <div className="metric-value">
                        {lib[metric.key] !== undefined && lib[metric.key] !== null
                          ? lib[metric.key].toFixed(1)
                          : '—'}
                      </div>
                      <div className="metric-bar">
                        <div
                          className="metric-bar-fill"
                          style={{
                            width: `${Math.min(100, Math.max(0, (lib[metric.key] || 0) * 10))}%`,
                            background: colors[idx % colors.length],
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              <div className="matrix-row">
                <div className="matrix-cell matrix-label">
                  <div className="matrix-label-title">GitHub Stars</div>
                  <div className="matrix-label-sub">Adoption signal from open-source activity</div>
                </div>
                {libraries.map((lib, idx) => (
                  <div key={`${lib.id}-stars`} className="matrix-cell">
                    <div className="metric-value">
                      {lib.githubStars ? lib.githubStars.toLocaleString() : '—'}
                    </div>
                    <div className="metric-bar">
                      <div
                        className="metric-bar-fill"
                        style={{
                          width: `${Math.min(100, Math.max(2, (lib.githubStars || 0) / 1000))}%`,
                          background: colors[idx % colors.length],
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="matrix-row">
                <div className="matrix-cell matrix-label">
                  <div className="matrix-label-title">Latest Version</div>
                  <div className="matrix-label-sub">Recency as a proxy for freshness</div>
                </div>
                {libraries.map((lib) => (
                  <div key={`${lib.id}-version`} className="matrix-cell">
                    <div className="metric-value">{lib.latestVersion || '—'}</div>
                  </div>
                ))}
              </div>

              <div className="matrix-row">
                <div className="matrix-cell matrix-label">
                  <div className="matrix-label-title">License</div>
                  <div className="matrix-label-sub">Compliance and distribution constraints</div>
                </div>
                {libraries.map((lib) => (
                  <div key={`${lib.id}-license`} className="matrix-cell">
                    <div className="metric-value">{lib.licenseType || '—'}</div>
                  </div>
                ))}
              </div>

              <div className="matrix-row">
                <div className="matrix-cell matrix-label">
                  <div className="matrix-label-title">Dependents</div>
                  <div className="matrix-label-sub">Projects depending on this library</div>
                </div>
                {libraries.map((lib, idx) => (
                  <div key={`${lib.id}-dependents`} className="matrix-cell">
                    <div className="metric-value">
                      {lib.dependentProjectsCount ? lib.dependentProjectsCount.toLocaleString() : '—'}
                    </div>
                    <div className="metric-bar">
                      <div
                        className="metric-bar-fill"
                        style={{
                          width: `${Math.min(100, Math.max(2, (lib.dependentProjectsCount || 0) / 1000))}%`,
                          background: colors[idx % colors.length],
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="matrix-row">
                <div className="matrix-cell matrix-label">
                  <div className="matrix-label-title">Forks</div>
                  <div className="matrix-label-sub">Community contribution potential</div>
                </div>
                {libraries.map((lib, idx) => (
                  <div key={`${lib.id}-forks`} className="matrix-cell">
                    <div className="metric-value">
                      {lib.githubForks ? lib.githubForks.toLocaleString() : '—'}
                    </div>
                    <div className="metric-bar">
                      <div
                        className="metric-bar-fill"
                        style={{
                          width: `${Math.min(100, Math.max(2, (lib.githubForks || 0) / 500))}%`,
                          background: colors[idx % colors.length],
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="matrix-row">
                <div className="matrix-cell matrix-label">
                  <div className="matrix-label-title">Last Update</div>
                  <div className="matrix-label-sub">Recency of repository activity</div>
                </div>
                {libraries.map((lib) => (
                  <div key={`${lib.id}-last-update`} className="matrix-cell">
                    <div className="metric-value">
                      {formatDate(lib.lastRepositoryReleaseDate)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="matrix-row">
                <div className="matrix-cell matrix-label">
                  <div className="matrix-label-title">Supported OS</div>
                  <div className="matrix-label-sub">Platform reach</div>
                </div>
                {libraries.map((lib) => (
                  <div key={`${lib.id}-os`} className="matrix-cell">
                    <div className="metric-value">
                      {formatSupportedOS(lib.supportedOs)}
                    </div>
                  </div>
                ))}
              </div>

                  <div className="matrix-row">
                    <div className="matrix-cell matrix-label">
                      <div className="matrix-label-title">Deprecated?</div>
                      <div className="matrix-label-sub">Indicator for deprecated libraries</div>
                    </div>
                    {libraries.map((lib) => (
                      <div key={`${lib.id}-deprecated`} className="matrix-cell">
                        <div className="metric-value">{lib.isDeprecated ? 'Yes' : 'No'}</div>
                      </div>
                    ))}
            </div>
            </div>
            </div>
          </section>
      </div>

        <aside className="comparison-side">
          <div className="explainer-card">
            <h3>How We Score</h3>
            <p>
              Each library is rated across five dimensions (0–10): Popularity, Maintenance, Security, Community, Quality.
            </p>
            <p>
              Scores are averaged to produce an Overall Score.
            </p>
            <ul className="metric-bullets">
              {metricMeta.map((metric) => (
                <li key={metric.key}>
                  <span className="metric-label">{metric.label}</span>
                  <span className="metric-description">{metric.description}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="explainer-card">
            <h3>Grade Legend</h3>
            <div className="grade-legend">
              {gradeLegend.map((item) => (
                <div key={item.grade} className="grade-row">
                  <span className={`grade-pill grade-${item.grade}`}>Grade {item.grade}</span>
                  <span className="grade-copy">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="explainer-card">
            <h3>Real World Use-Case</h3>
            <div className="usecase-grid">
              {metricMeta.map((metric) => (
                <div key={metric.key} className="usecase-card">
                  <div className="usecase-title">{metric.label}</div>
                  <div className="usecase-body">{metric.useCase}</div>
                </div>
              ))}
            </div>
          </div>
        </aside>
        </div>
      </div>
    </div>
  );
}

export default ComparisonView;

