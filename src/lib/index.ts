/**
 * Main library exports
 * This file serves as the entry point for the $lib alias
 *
 * For more specific imports, use the aliased paths:
 * - $components/* for individual components
 * - $lib/sections/* for page sections
 * - $utils/* for utility functions
 * - $lib/actions/* for Svelte actions
 * - $data for data exports
 */

// Re-export utilities
export * from './utils';

// Re-export actions
export * from './actions';

// Re-export data
export * from './data';

// Note: Components and sections are not re-exported here to avoid naming conflicts
// Use the $components and $lib/sections aliases instead

