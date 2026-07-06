// Vitest setup: extends `expect` with jest-dom matchers (toBeInTheDocument, etc.)
// and ensures a clean DOM between tests so component tests never leak into one another.
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
