import { lazy } from 'react';

// Lazy load 3D games for better performance
export const DigitalJenga3D = lazy(() => import('./DigitalJenga3D'));
export const DressForWeather3D = lazy(() => import('./DressForWeather3D'));
export const ObstacleCourse3D = lazy(() => import('./ObstacleCourse3D'));
export const FeedTheMonster3D = lazy(() => import('./FeedTheMonster3D'));
export const VirtualBubbles3D = lazy(() => import('./VirtualBubbles3D'));

// Re-export for direct imports
export { default as DigitalJenga3DPage } from './DigitalJenga3D';
export { default as DressForWeather3DPage } from './DressForWeather3D';
export { default as ObstacleCourse3DPage } from './ObstacleCourse3D';
export { default as FeedTheMonster3DPage } from './FeedTheMonster3D';
export { default as VirtualBubbles3DPage } from './VirtualBubbles3D';
