'use client';

import { VisualEditing } from '@sanity/visual-editing/react';

export const VisualEditingWrapper = () => {
  return <VisualEditing portal={false} />;
};

VisualEditingWrapper.displayName = 'VisualEditingWrapper';
