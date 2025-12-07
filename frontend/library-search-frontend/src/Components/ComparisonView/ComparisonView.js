import React, { useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line } from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './ComparisonView.css';

function ComparisonView({ libraries, onClose, onRemoveLibrary }) {

  const chartsRef = useRef(null);

  // Use overall score from backend (calculated by unified ComparisonService)
  // If not available, fallback to simple calculation for backward compatibility
  const getOverallScore = (library) => {
    if (library.overallScore !== null && library.overallScore !== undefined) {
      return library.overallScore.toFixed(1);
    }
    // Fallback: simple average if backend score not available
    return calculateFallbackScore(library);
  };

  // Fallback score calculation (only used if backend score not available)
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

  // Format numbers for display
  const formatNumber = (num) => {
    if (!num || num === 0) return 'N/A';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num?.toLocaleString();
  };

  // Format date
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

  // Format supported OS list
  const formatSupportedOS = (supportedOs) => {
    if (!supportedOs || supportedOs.length === 0) return 'Not specified';
    if (supportedOs.length <= 3) return supportedOs.join(', ');
    return `${supportedOs.slice(0, 3).join(', ')} +${supportedOs.length - 3} more`;
  };

  const colors = ['#667eea', '#f56565', '#48bb78', '#ed8936', '#9f7aea', '#38b2ac'];

  // Find the library with the highest score
  const scores = libraries.map(lib => parseFloat(getOverallScore(lib)));
  const maxScore = Math.max(...scores);

  // Prepare data for charts
  const barChartData = libraries.map((lib, idx) => ({
    name: lib.name.length > 15 ? lib.name.substring(0, 15) + '...' : lib.name,
    fullName: lib.name,
    stars: lib.githubStars || 0,
    forks: lib.githubForks || 0,
    dependents: lib.dependentProjectsCount || 0,
    overallScore: parseFloat(getOverallScore(lib)),
    color: colors[idx % colors.length]
  }));

  // Prepare radar chart data for multi-dimensional scores
  // Recharts RadarChart needs data structured as: [{ dimension: 'Popularity', Library1: value1, Library2: value2, ... }, ...]
  const radarChartData = [
    { dimension: 'Popularity', ...libraries.reduce((acc, lib, idx) => {
      const libName = lib.name.length > 15 ? lib.name.substring(0, 15) + '...' : lib.name;
      acc[libName] = lib.popularityScore || 0;
      return acc;
    }, {}) },
    { dimension: 'Maintenance', ...libraries.reduce((acc, lib, idx) => {
      const libName = lib.name.length > 15 ? lib.name.substring(0, 15) + '...' : lib.name;
      acc[libName] = lib.maintenanceScore || 0;
      return acc;
    }, {}) },
    { dimension: 'Security', ...libraries.reduce((acc, lib, idx) => {
      const libName = lib.name.length > 15 ? lib.name.substring(0, 15) + '...' : lib.name;
      acc[libName] = lib.securityScore || 0;
      return acc;
    }, {}) },
    { dimension: 'Community', ...libraries.reduce((acc, lib, idx) => {
      const libName = lib.name.length > 15 ? lib.name.substring(0, 15) + '...' : lib.name;
      acc[libName] = lib.communityScore || 0;
      return acc;
    }, {}) },
    { dimension: 'Quality', ...libraries.reduce((acc, lib, idx) => {
      const libName = lib.name.length > 15 ? lib.name.substring(0, 15) + '...' : lib.name;
      acc[libName] = lib.qualityScore || 0;
      return acc;
    }, {}) }
  ];

  // Prepare overall scores comparison data
  const overallScoresData = libraries.map((lib, idx) => ({
    name: lib.name.length > 15 ? lib.name.substring(0, 15) + '...' : lib.name,
    fullName: lib.name,
    'Overall Score': parseFloat(getOverallScore(lib)),
    color: colors[idx % colors.length]
  }));

  // Export charts as PNG
  const exportChartsAsPNG = async () => {
    if (!chartsRef.current) return;
    
    try {
      const canvas = await html2canvas(chartsRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
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

  // Export charts as PDF
  const exportChartsAsPDF = async () => {
    if (!chartsRef.current) return;
    
    try {
      const canvas = await html2canvas(chartsRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;
      
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
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
          <h1>Library Comparison</h1>
          <p className="comparison-subtitle">Comprehensive analysis of {libraries.length} libraries</p>
        </div>
        <div className="header-actions">
          <button className="export-btn export-png" onClick={exportChartsAsPNG}>
            📥 Export PNG
          </button>
          <button className="export-btn export-pdf" onClick={exportChartsAsPDF}>
            📄 Export PDF
          </button>
          <button className="close-btn-fullscreen" onClick={onClose} aria-label="Close comparison">
            ✕ Close
          </button>
        </div>
      </div>

      <div className="comparison-content-fullscreen" ref={chartsRef}>
        {/* Charts Section */}
        <section className="charts-section">
          {/* Overall Scores Comparison - Bar Chart */}
          <div className="chart-container">
            <h3 className="chart-title">Overall Scores Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={overallScoresData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <YAxis 
                  domain={[0, 10]}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  label={{ value: 'Score (out of 10)', angle: -90, position: 'insideLeft', style: { fill: '#64748b' } }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                  formatter={(value) => {
                    const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;
                    return [`${numValue.toFixed(1)} / 10`, 'Overall Score'];
                  }}
                />
                <Legend />
                <Bar dataKey="Overall Score" fill="#667eea" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Multi-dimensional Scores - Radar Chart */}
          {radarChartData.length > 0 && libraries.some(lib => lib.popularityScore !== undefined) && (
            <div className="chart-container">
              <h3 className="chart-title">Multi-dimensional Scores Comparison</h3>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={radarChartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis 
                    dataKey="dimension" 
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 10]}
                    tick={{ fill: '#64748b', fontSize: 10 }}
                  />
                  {libraries.map((lib, idx) => {
                    const libName = lib.name.length > 15 ? lib.name.substring(0, 15) + '...' : lib.name;
                    return (
                      <Radar
                        key={lib.id}
                        name={lib.name}
                        dataKey={libName}
                        stroke={colors[idx % colors.length]}
                        fill={colors[idx % colors.length]}
                        fillOpacity={0.6}
                      />
                    );
                  })}
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* GitHub Stars Comparison - Bar Chart */}
          <div className="chart-container">
            <h3 className="chart-title">GitHub Stars Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <YAxis 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  label={{ value: 'Number of Stars', angle: -90, position: 'insideLeft', style: { fill: '#64748b' } }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                  formatter={(value) => {
                    const numValue = typeof value === 'number' ? value : (parseFloat(value) || 0);
                    return [formatNumber(numValue), 'Stars'];
                  }}
                />
                <Legend />
                <Bar dataKey="stars" fill="#fbbf24" radius={[8, 8, 0, 0]}>
                  {barChartData.map((entry, index) => (
                    <Bar key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Forks and Dependents Comparison - Grouped Bar Chart */}
          <div className="chart-container">
            <h3 className="chart-title">Forks & Dependents Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <YAxis 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  label={{ value: 'Count', angle: -90, position: 'insideLeft', style: { fill: '#64748b' } }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                  formatter={(value, name) => {
                    const numValue = typeof value === 'number' ? value : (parseFloat(value) || 0);
                    return [formatNumber(numValue), name === 'forks' ? 'Forks' : 'Dependents'];
                  }}
                />
                <Legend />
                <Bar dataKey="forks" fill="#48bb78" radius={[8, 8, 0, 0]} />
                <Bar dataKey="dependents" fill="#ed8936" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Scorecard Section */}
        <section className="scorecard-section-fullscreen">
          <h2 className="section-title">Detailed Library Information</h2>
          <div className="scorecard-grid">
            {libraries.map((library, idx) => {
              const overallScore = getOverallScore(library);
              const isTopScore = parseFloat(overallScore) === maxScore && libraries.length > 1;

              return (
                <div key={library.id} className="library-scorecard-fullscreen" style={{ borderTopColor: colors[idx % colors.length] }}>
                  <div className="scorecard-header-fullscreen">
                    <div>
                      <h3>{library.name}</h3>
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
                      {isTopScore && (
                        <div className="top-score-badge-fullscreen">🏆 Top Score</div>
                      )}
                    </div>
                    {/* Multi-dimensional scores breakdown */}
                    {(library.popularityScore !== undefined || library.maintenanceScore !== undefined || 
                      library.securityScore !== undefined || library.communityScore !== undefined) && (
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

                  {/* Links */}
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
      </div>
    </div>
  );
}

export default ComparisonView;
