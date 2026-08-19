// Compatibility seam for existing list/card imports. Resource-state policy lives
// in evidence.ts so every surface uses the same endpoint aggregation rules.
export {
  getProjectResourceState,
  type ProjectResourceState,
  type ProjectResourceStateKey,
} from './project-resource-state';
