'use client';

import { useState, useEffect } from 'react';

// Export a dummy hook that returns nulls to satisfy existing components
// until they are refactored.
export const useSpacetime = () => {
  return {
    db: null,
    identity: null,
    isConnected: true
  };
};
