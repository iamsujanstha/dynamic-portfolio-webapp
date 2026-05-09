/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * SimulationService
 * 
 * A professional-grade utility for managing local session-based overrides.
 * Follows the Singleton pattern to ensure consistent state across the application.
 */

export enum SimKey {
  PAGES = 'sim_pages',
  PROJECTS = 'sim_projects',
  SETTINGS = 'sim_settings',
  ASSETS = 'sim_assets'
}

class SimulationService {
  private static instance: SimulationService;
  private listeners: Set<() => void> = new Set();

  private constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key?.startsWith('sim_')) {
          this.notify();
        }
      });
    }
  }

  public static getInstance(): SimulationService {
    if (!SimulationService.instance) {
      SimulationService.instance = new SimulationService();
    }
    return SimulationService.instance;
  }

  /**
   * Saves data to local storage for simulation
   */
  public save<T>(key: SimKey, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      this.notify();
    } catch (error) {
      console.error(`[SimulationService] Failed to save ${key}:`, error);
    }
  }

  /**
   * Retrieves simulated data
   */
  public get<T>(key: SimKey): T | null {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`[SimulationService] Failed to parse ${key}:`, error);
      return null;
    }
  }

  /**
   * Clears all simulated data
   */
  public clearAll(): void {
    Object.values(SimKey).forEach(key => localStorage.removeItem(key));
    this.notify();
  }

  /**
   * Check if any simulation is active
   */
  public isActive(): boolean {
    return Object.values(SimKey).some(key => !!localStorage.getItem(key));
  }

  /**
   * Observer Pattern: Subscribe to simulation changes
   */
  public subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notify(): void {
    this.listeners.forEach(callback => callback());
  }
}

export const simulationService = SimulationService.getInstance();
