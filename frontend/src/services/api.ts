/**
 * API client for the Lattica backend.
 *
 * All backend communication goes through this module.
 * Keeps API details (URLs, headers) out of components.
 */

import axios from "axios";
import type { Scan, ScanCreate, ScanSummary } from "../types";

// Base URL for the FastAPI backend — Vite dev server proxies aren't
// needed since we have CORS configured on the backend.
const API_BASE = "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

/**
 * Create and run a new TLS scan.
 * The backend runs sslyze inline, so this call blocks until
 * the scan completes (typically 3–15 seconds).
 */
export async function createScan(payload: ScanCreate): Promise<Scan> {
  const { data } = await api.post<Scan>("/scans/", payload);
  return data;
}

/**
 * List all scans (summary view, no findings).
 * Returns most recent first.
 */
export async function listScans(): Promise<ScanSummary[]> {
  const { data } = await api.get<ScanSummary[]>("/scans/");
  return data;
}

/**
 * Get a single scan with all its scored findings.
 */
export async function getScan(scanId: number): Promise<Scan> {
  const { data } = await api.get<Scan>(`/scans/${scanId}`);
  return data;
}
