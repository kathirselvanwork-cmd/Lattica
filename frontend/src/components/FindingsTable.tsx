/**
 * FindingsTable — displays scored TLS findings from a scan.
 *
 * This is where the HNDL scoring becomes visible to the user.
 * Each finding shows:
 *   - Severity badge (color-coded: critical/high/medium/low)
 *   - The crypto primitive found (cipher suite, protocol, cert type)
 *   - HNDL risk score (S × R × E)
 *   - Crypto exposure score (E)
 *   - Expandable row with NIST deadline, PQC replacement, and migration notes
 *
 * Findings arrive pre-sorted by HNDL risk (worst first) from the backend.
 */

import { useState } from "react";
import type { Scan, Finding } from "../types";
import "./FindingsTable.css";

interface FindingsTableProps {
  scan: Scan;
}

// Badge colors for each severity bucket
const SEVERITY_COLORS: Record<string, string> = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
  low: "#22c55e",
};

// Human-readable finding type labels
const TYPE_LABELS: Record<string, string> = {
  protocol: "Protocol",
  cipher_suite: "Cipher Suite",
  certificate: "Certificate",
  key_exchange: "Key Exchange",
};

export default function FindingsTable({ scan }: FindingsTableProps) {
  // Track which finding rows are expanded to show remediation details
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Count findings by severity for the summary bar
  const severityCounts = scan.findings.reduce(
    (acc, f) => {
      acc[f.severity_bucket] = (acc[f.severity_bucket] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  if (scan.status === "failed") {
    return (
      <div className="findings-error">
        <h3>Scan Failed</h3>
        <p>{scan.error_message || "Unknown error"}</p>
      </div>
    );
  }

  if (scan.status === "running" || scan.status === "pending") {
    return (
      <div className="findings-loading">
        <div className="spinner" />
        <p>Scanning {scan.domain}...</p>
      </div>
    );
  }

  return (
    <div className="findings-container">
      {/* Scan summary header */}
      <div className="scan-header">
        <h2>{scan.domain}</h2>
        <div className="scan-meta">
          <span>
            S={scan.data_sensitivity} R={scan.retention_horizon}
          </span>
          <span>{scan.findings.length} findings</span>
          <span>
            {scan.completed_at
              ? new Date(scan.completed_at).toLocaleString()
              : ""}
          </span>
        </div>
      </div>

      {/* Severity summary bar — quick visual overview */}
      <div className="severity-summary">
        {(["critical", "high", "medium", "low"] as const).map((bucket) => (
          <div key={bucket} className="severity-chip">
            <span
              className="severity-dot"
              style={{ background: SEVERITY_COLORS[bucket] }}
            />
            <span className="severity-count">
              {severityCounts[bucket] || 0}
            </span>
            <span className="severity-label">{bucket}</span>
          </div>
        ))}
      </div>

      {/* Findings table */}
      <div className="findings-table-wrapper">
        <table className="findings-table">
          <thead>
            <tr>
              <th>Severity</th>
              <th>Type</th>
              <th>Finding</th>
              <th>HNDL Risk</th>
              <th>Exposure (E)</th>
            </tr>
          </thead>
          <tbody>
            {scan.findings.map((finding) => (
              <FindingRow
                key={finding.id}
                finding={finding}
                isExpanded={expandedIds.has(finding.id)}
                onToggle={() => toggleExpand(finding.id)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Individual finding row — click to expand remediation details
// ---------------------------------------------------------------------------

interface FindingRowProps {
  finding: Finding;
  isExpanded: boolean;
  onToggle: () => void;
}

function FindingRow({ finding, isExpanded, onToggle }: FindingRowProps) {
  return (
    <>
      <tr className="finding-row" onClick={onToggle}>
        {/* Severity badge */}
        <td>
          <span
            className="severity-badge"
            style={{
              background: SEVERITY_COLORS[finding.severity_bucket],
            }}
          >
            {finding.severity_bucket}
          </span>
        </td>

        {/* Finding type */}
        <td className="finding-type">
          {TYPE_LABELS[finding.finding_type] || finding.finding_type}
        </td>

        {/* The actual crypto primitive */}
        <td className="finding-value">{finding.value}</td>

        {/* Composite HNDL risk score */}
        <td className="finding-score">{finding.hndl_risk_score}</td>

        {/* Crypto exposure score (the E in S×R×E) */}
        <td className="finding-exposure">{finding.crypto_exposure_score}/5</td>
      </tr>

      {/* Expanded remediation details */}
      {isExpanded && (
        <tr className="finding-details-row">
          <td colSpan={5}>
            <div className="finding-details">
              {finding.nist_deadline && (
                <div className="detail-item">
                  <strong>NIST Deadline:</strong> {finding.nist_deadline}
                </div>
              )}
              {finding.pqc_replacement && (
                <div className="detail-item">
                  <strong>PQC Replacement:</strong> {finding.pqc_replacement}
                </div>
              )}
              {finding.migration_notes && (
                <div className="detail-item migration-notes">
                  <strong>Migration Guidance:</strong> {finding.migration_notes}
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
