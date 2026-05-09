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
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const update = () => {
      setIsActive(simulationService.isActive());
      setVersion(v => v + 1);
    };
    
    update();
    return simulationService.subscribe(update);
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
    version,
    getSimData,
    saveSimData,
    resetSimulation
  };
}
