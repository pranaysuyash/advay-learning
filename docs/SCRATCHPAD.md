# Project Scratchpad: Advay Vision Learning

This scratchpad is a shared space for AI agents and human collaborators to track ongoing ideas, minor blockers, and cross-component coordination notes that don't yet warrant a full ticket.

## Standard Formatting
- Use GitHub-style alerts for visibility.
- Group items by component/feature.
- Use `[ ]` for pending and `[x]` for resolved ideas.

---

## 🏗️ Ongoing Coordination

### Digital Jenga 3D
- [ ] **Interaction Stability**: Block extraction logic was recently refined in `useGrabController.ts`. Verification is pending.
- [ ] **Visual Assets**: Game card images are being generated to replace placeholders.
- [ ] **Hand Tracking**: "Rayman Hand" visualization is implemented but needs testing in different lighting conditions.

### 🧪 Design Ideas
- [ ] **Animated Game Cards**: Explore using CSS/Framer Motion to animate the generated game card assets for a more "premium" feel.
- [ ] **Haptic Feedback**: Ensure `triggerHaptic` is consistently used across all new 3D components.

---

## 📝 Coordination Notes
- **Antigravity (2026-03-14)**: Switched dev server to port 6173. Ensure all local tests target this port.
- **Antigravity (2026-03-14)**: Registered manual `triggerRender` in `DigitalJenga3D.tsx` to handle `GameState` mutations since it's a classes-based mutable object.

---

## 🛠️ Instructions for Agents
1. **Check before starting**: Always read the latest entries here to see if another agent has left a note about a file you are about to edit.
2. **Append, don't overwrite**: Add new sections or items at the bottom of relevant categories.
3. **Link artifacts**: If a scratchpad item leads to a new audit or plan, link it here.
