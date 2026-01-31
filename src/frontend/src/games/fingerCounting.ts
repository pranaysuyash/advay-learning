export interface Point {
  x: number;
  y: number;
}

/**
 * Count extended fingers from MediaPipe hand landmarks.
 * Returns a number from 0-5 representing how many fingers are extended.
 */
export function countExtendedFingersFromLandmarks(landmarks: Point[]): number {
  const dist = (a: Point, b: Point) => {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const wrist = landmarks[0];
  const indexMcp = landmarks[5];
  const middleMcp = landmarks[9];
  const ringMcp = landmarks[13];
  const pinkyMcp = landmarks[17];

  if (!wrist) return 0;

  // Palm center is a stable reference even when the hand rotates (helps thumb).
  const palmPoints = [wrist, indexMcp, middleMcp, ringMcp, pinkyMcp].filter(
    Boolean,
  ) as Point[];
  const palmCenter =
    palmPoints.length > 0
      ? palmPoints.reduce(
          (acc, p) => ({
            x: acc.x + p.x / palmPoints.length,
            y: acc.y + p.y / palmPoints.length,
          }),
          { x: 0, y: 0 },
        )
      : wrist;

  // Fingers (index/middle/ring/pinky):
  // Primary heuristic: tip is "up" relative to PIP (works for upright hands).
  // Fallback heuristic: tip is further from wrist than PIP (works for rotated/sideways hands).
  const fingerPairs = [
    { tip: 8, pip: 6 },
    { tip: 12, pip: 10 },
    { tip: 16, pip: 14 },
    { tip: 20, pip: 18 },
  ];

  let count = 0;
  for (const pair of fingerPairs) {
    const tip = landmarks[pair.tip];
    const pip = landmarks[pair.pip];
    if (!tip || !pip) continue;
    const up = tip.y < pip.y;
    const further = dist(tip, wrist) > dist(pip, wrist) + 0.07; // Fine-tuned to 0.07
    if (up || further) count++;
  }

  // Thumb:
  // Improved detection for kids' hands - uses multiple heuristics for reliability.
  const thumbTip = landmarks[4];
  const thumbIp = landmarks[3];
  const thumbMcp = landmarks[2];
  if (thumbTip && thumbIp && thumbMcp) {
    // Quick fold check: if tip and IP are very close, thumb is folded
    const thumbFolded = dist(thumbTip, thumbIp) < 0.03;
    if (thumbFolded) {
      // Skip extended detection, thumb is clearly folded
    } else {
      // Distance-based: tip should be further from palm center than MCP
      const tipToPalm = dist(thumbTip, palmCenter);
      const mcpToPalm = dist(thumbMcp, palmCenter);
      const thumbExtendedFromPalm = tipToPalm > mcpToPalm * 0.8;

      // Spread-based: thumb tip should be away from index finger
      const thumbSpread = indexMcp ? dist(thumbTip, indexMcp) > 0.15 : true;

      // Angle-based: thumb tip should not be too close to other fingers when closed
      const thumbTipToIndexTip = landmarks[8]
        ? dist(thumbTip, landmarks[8])
        : 1;
      const thumbNotTucked = thumbTipToIndexTip > 0.08;

      // Count thumb if majority of conditions pass (2 out of 3)
      let thumbConditions = 0;
      if (thumbExtendedFromPalm) thumbConditions++;
      if (thumbSpread) thumbConditions++;
      if (thumbNotTucked) thumbConditions++;

      if (thumbConditions >= 2) count++;
    }
  }

  return count;
}
