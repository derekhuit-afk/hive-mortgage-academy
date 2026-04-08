"use client";
import { useEffect, useCallback } from "react";

const TOKEN_KEY = "hma_token";

async function apiHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
  return { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

// Sync a named tool's data to Supabase (fire-and-forget, never blocks UI)
export async function syncTool(toolName: string, data: any) {
  try {
    const headers = await apiHeaders();
    await fetch("/api/tool-data", { method: "POST", headers, body: JSON.stringify({ tool: toolName, data }) });
  } catch { /* silent — localStorage is source of truth */ }
}

// Load tool data from Supabase on mount, merge with localStorage
export async function loadTool(toolName: string, localKey: string): Promise<any | null> {
  try {
    const headers = await apiHeaders();
    const res = await fetch(`/api/tool-data?tool=${toolName}`, { headers });
    if (!res.ok) return null;
    const { data, updated_at } = await res.json();
    if (!data) return null;

    // Compare with localStorage timestamp
    const localRaw = localStorage.getItem(localKey + "_meta");
    const localMeta = localRaw ? JSON.parse(localRaw) : null;
    const localUpdated = localMeta?.updated_at || "1970-01-01";
    
    if (updated_at && updated_at > localUpdated) {
      // Supabase is newer — update localStorage
      localStorage.setItem(localKey, JSON.stringify(data));
      localStorage.setItem(localKey + "_meta", JSON.stringify({ updated_at }));
      return data;
    }
    return null; // localStorage is newer or same
  } catch { return null; }
}

// Save to both localStorage and Supabase
export function saveAndSync(localKey: string, toolName: string, data: any) {
  localStorage.setItem(localKey, JSON.stringify(data));
  const meta = { updated_at: new Date().toISOString() };
  localStorage.setItem(localKey + "_meta", JSON.stringify(meta));
  syncTool(toolName, data); // non-blocking
}
