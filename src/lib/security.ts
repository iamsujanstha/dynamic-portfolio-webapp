/**
 * @license
 * Copyright (c) 2026 Sujan Shrestha. All rights reserved.
 * 
 * This source code is proprietary and confidential. 
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Written by Sujan Shrestha <sujan.sjv08@gmail.com>
 */

import bcrypt from 'bcryptjs';

export const validateSystemIdentity = () => {
  const key = process.env.SYSTEM_IDENTITY_KEY;
  // This is a one-way Bcrypt hash of your secret key.
  // It is mathematically impossible to reverse-engineer the original key from this.
  const hashedIdentity = '$2b$10$sFNXbS.t2nHRtNzvsit0eeurSMBxxuJ.pt9fakZFVpaGTRD1ON5rq';
  
  if (!key) return false;

  try {
    // Synchronous comparison is fine for this check at startup/service level
    return bcrypt.compareSync(key, hashedIdentity);
  } catch {
    return false;
  }
};
