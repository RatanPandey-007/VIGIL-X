/**
 * VIGIL-X API Client
 * Connects to FastAPI backend with graceful fallbacks and error handling
 */

import {
  SystemMetrics,
  ComponentEvaluation,
  LotFingerprint,
  ModelPerformanceData,
  EvidenceChain,
  ForecastEvaluation,
  LotHealthRadarData,
  AttributionBenchmark
} from '../types';

const API_BASE = '/api';

export const api = {
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Failed to fetch system health');
    return res.json();
  },

  async getMetrics(): Promise<SystemMetrics> {
    const res = await fetch(`${API_BASE}/metrics`);
    if (!res.ok) throw new Error('Failed to fetch system metrics');
    return res.json();
  },

  async getComponents(lotId?: string) {
    const url = lotId ? `${API_BASE}/components?lot_id=${lotId}` : `${API_BASE}/components`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch components');
    return res.json();
  },

  async getComponentDetails(componentId: string): Promise<ComponentEvaluation> {
    const res = await fetch(`${API_BASE}/components/${componentId}`);
    if (!res.ok) throw new Error(`Failed to fetch component ${componentId}`);
    return res.json();
  },

  async getLots(): Promise<{ current_hour: number; lots: LotFingerprint[] }> {
    const res = await fetch(`${API_BASE}/lots`);
    if (!res.ok) throw new Error('Failed to fetch lot fingerprints');
    return res.json();
  },

  async getAlerts() {
    const res = await fetch(`${API_BASE}/alerts`);
    if (!res.ok) throw new Error('Failed to fetch alerts');
    return res.json();
  },

  async getEvidenceChain(componentId: string): Promise<EvidenceChain> {
    const res = await fetch(`${API_BASE}/components/${componentId}/evidence`);
    if (!res.ok) throw new Error(`Failed to fetch evidence chain for ${componentId}`);
    return res.json();
  },

  async getForecast(componentId: string): Promise<ForecastEvaluation> {
    const res = await fetch(`${API_BASE}/components/${componentId}/forecast`);
    if (!res.ok) throw new Error(`Failed to fetch forecast for ${componentId}`);
    return res.json();
  },

  async getModelPerformance(): Promise<ModelPerformanceData> {
    const res = await fetch(`${API_BASE}/model-performance`);
    if (!res.ok) throw new Error('Failed to fetch model performance');
    return res.json();
  },

  // Simulation Controls
  async startSimulation() {
    const res = await fetch(`${API_BASE}/simulate/start`, { method: 'POST' });
    return res.json();
  },

  async pauseSimulation() {
    const res = await fetch(`${API_BASE}/simulate/pause`, { method: 'POST' });
    return res.json();
  },

  async resetSimulation() {
    const res = await fetch(`${API_BASE}/simulate/reset`, { method: 'POST' });
    return res.json();
  },

  async setSpeed(speed: number) {
    const res = await fetch(`${API_BASE}/simulate/speed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ speed })
    });
    return res.json();
  },

  async stepHour(hour: number) {
    const res = await fetch(`${API_BASE}/simulate/step`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hour })
    });
    return res.json();
  },

  async injectDefect(componentId = 'C-104') {
    const res = await fetch(`${API_BASE}/simulate/inject-defect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ component_id: componentId })
    });
    return res.json();
  },

  async heroDemoReset(scenario = 'isolated_component') {
    const res = await fetch(`${API_BASE}/demo/hero-reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario })
    });
    return res.json();
  },

  async setDemoScenario(scenario: string) {
    const res = await fetch(`${API_BASE}/demo/scenario`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario })
    });
    if (!res.ok) throw new Error('Failed to set demo scenario');
    return res.json();
  },

  async getLotHealthRadar(lotId: string): Promise<LotHealthRadarData> {
    const res = await fetch(`${API_BASE}/lots/${lotId}/health-radar`);
    if (!res.ok) throw new Error(`Failed to fetch health radar for lot ${lotId}`);
    return res.json();
  },

  async getTriangulationBenchmark(): Promise<AttributionBenchmark> {
    const res = await fetch(`${API_BASE}/triangulation/benchmark`);
    if (!res.ok) throw new Error('Failed to fetch triangulation benchmark');
    return res.json();
  }
};
