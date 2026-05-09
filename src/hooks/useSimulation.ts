/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { simulationService, SimKey } from '../services/simulationService';

/**
 * useSimulation hook
 * 
 * Provides a reactive way to access and update simulation data.
 * Automatically re-renders when simulation data changes in any tab.
 */
export function useSimulation() {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    setIsActive(simulationService.isActive());
    return simulationService.subscribe(() => {
      setIsActive(simulationService.isActive());
    });
  }, []);

  const getSimData = useCallback(<T>(key: SimKey): T | null => {
    return simulationService.get<T>(key);
  }, []);

  const saveSimData = useCallback(<T>(key: SimKey, data: T) => {
    simulationService.save(key, data);
  }, []);

  const resetSimulation = useCallback(() => {
    simulationService.clearAll();
  }, []);

  return {
    isActive,
    getSimData,
    saveSimData,
    resetSimulation
  };
}
