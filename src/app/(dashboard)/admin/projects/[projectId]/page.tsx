'use client';

// This page re-exports the project detail under the new /admin/projects/[projectId] path.
// The actual content is in the existing projects/[projectId]/page.tsx which we keep as-is
// to avoid code duplication. This file just delegates to it via a dynamic import.
export { default } from '@/app/(dashboard)/projects/[projectId]/page';
