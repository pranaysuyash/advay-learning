export type PaintingTool = 'brush' | 'splatter' | 'smear' | 'stamp';
export type PaintingColor = string;

export interface FingerPaintingState {
  selectedColor: PaintingColor;
  selectedTool: PaintingTool;
  brushSize: number;
}

export const INITIAL_FINGER_PAINTING_STATE: FingerPaintingState = {
  selectedColor: '#FF0000', // Red
  selectedTool: 'brush',
  brushSize: 20,
};

export const PAINT_COLORS = [
  { name: 'Red', hex: '#FF0000' },
  { name: 'Orange', hex: '#FF7F00' },
  { name: 'Yellow', hex: '#FFFF00' },
  { name: 'Green', hex: '#00FF00' },
  { name: 'Blue', hex: '#0000FF' },
  { name: 'Purple', hex: '#8B00FF' },
  { name: 'Brown', hex: '#8B4513' },
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
];

export const PAINTING_TOOLS: { id: PaintingTool; label: string; icon: string }[] = [
  { id: 'brush', label: 'Brush', icon: '🖌️' },
  { id: 'splatter', label: 'Splatter', icon: '💦' },
  { id: 'smear', label: 'Smear', icon: '🖐️' },
  { id: 'stamp', label: 'Stamp', icon: '⭐' },
];

export function getRandomColor(): string {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
