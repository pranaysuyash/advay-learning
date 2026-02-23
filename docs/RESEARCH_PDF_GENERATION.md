# PDF Generation Research

**Date**: 2026-02-23
**Researcher**: AI Agent
**Purpose**: Evaluate lightweight approaches for client-side PDF generation without heavy library dependencies

---

## Current State

**Finding**: "No PDF library installed. Will use lightweight approach: Canvas-based image export + formatted text."

**Current Implementation** (`src/frontend/src/utils/reportExport.ts`):

- Generates formatted text reports (`.txt` files)
- Exports progress data as plain text with emoji formatting
- Supports WhatsApp sharing via URL encoding
- No PDF generation capability currently exists

---

## Research Findings

### Option 1: Lightweight PDF Libraries (Recommended for Progress Reports)

| Library     | Size                 | Best For                              | Approach                                            |
| ----------- | -------------------- | ------------------------------------- | --------------------------------------------------- |
| **jsPDF**   | ~300KB               | Simple documents, receipts, labels    | Low-level drawing API with X/Y coordinates          |
| **pdf-lib** | ~400-500KB           | Dynamic content, images, fonts        | TypeScript-first, modular, can modify existing PDFs |
| **pdfmake** | ~600KB+ (with fonts) | Reports, invoices, structured layouts | Declarative JSON-based layout definitions           |

#### jsPDF - Best for Progress Reports

```javascript
import { jsPDF } from 'jspdf';

function generatePDF(data) {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(20);
  doc.text(`${childName}'s Learning Report`, 10, 20);

  // Date
  doc.setFontSize(12);
  doc.text(reportDate, 10, 30);

  // Time Summary
  doc.setFontSize(14);
  doc.text('Time Summary', 10, 45);
  doc.setFontSize(12);
  doc.text(
    `Total this week: ${timeBreakdown.totalMinutesWeek} minutes`,
    10,
    55,
  );
  doc.text(
    `Daily average: ${timeBreakdown.averageMinutesPerDay} minutes`,
    10,
    62,
  );

  // Progress Summary
  doc.setFontSize(14);
  doc.text('Progress Summary', 10, 80);
  doc.setFontSize(12);
  doc.text(`Activities completed: ${totalActivities}`, 10, 90);
  doc.text(`Average accuracy: ${Math.round(averageAccuracy)}%`, 10, 97);

  // Save
  doc.save(`${childName}_progress_${date}.pdf`);
}
```

**Pros**:

- Lightweight (~300KB)
- No server required
- Full control over layout
- Works offline
- Good for simple formatted reports

**Cons**:

- Manual layout positioning required
- No CSS support
- Custom fonts require embedding

---

### Option 2: Canvas-Based Image Export + PDF Embedding

For visual reports with charts/graphics:

```javascript
// Render report to canvas
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

// Draw report content
ctx.fillStyle = 'white';
ctx.fillRect(0, 0, canvas.width, canvas.height);

ctx.fillStyle = '#1a1a2e';
ctx.font = 'bold 24px sans-serif';
ctx.fillText('Learning Report', 20, 40);

// ... draw more content

// Option A: Export as image only
const imageData = canvas.toDataURL('image/png');

// Option B: Embed in PDF using jsPDF
const doc = new jsPDF();
const imgData = canvas.toDataURL('image/png');
doc.addImage(imgData, 'PNG', 0, 0, 210, 297); // A4 size
doc.save('report.pdf');
```

**Pros**:

- Visual fidelity (exact canvas rendering)
- Can include charts/graphics
- No layout code needed

**Cons**:

- Text not selectable in output
- Larger file sizes
- More complex implementation

---

### Option 3: html2canvas + jsPDF (Hybrid)

For complex layouts without manual positioning:

```javascript
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

async function generatePDFFromHTML(element) {
  const canvas = await html2canvas(element, { scale: 2 });
  const imgData = canvas.toDataURL('image/png');

  const pdf = new jsPDF('p', 'mm', 'a4');
  const imgWidth = 210;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
  pdf.save('report.pdf');
}
```

**Note**: This adds `html2canvas` (~500KB) dependency.

---

## Recommendation

### For Progress Reports (Current Use Case)

**Recommended: jsPDF** - Best balance of size and functionality

**Rationale**:

1. **Lightweight**: ~300KB is acceptable for progress report feature
2. **Simple layout**: Progress reports are text-heavy, perfect for jsPDF
3. **No server**: Fully client-side, respects privacy
4. **Offline capable**: Works without internet
5. **Maintainable**: Simple API, easy to extend

**Bundle size impact**:

- jsPDF: ~300KB (gzipped: ~100KB)
- Compare to current: 0KB (text-only)

### For Future Enhancement (Visual Reports with Charts)

Consider **html2canvas + jsPDF** when:

- Progress visualization needs charts/graphs
- Want exact WYSIWYG with web styling
- Have time for more complex implementation

---

## Implementation Plan

### Phase 1: Basic PDF Reports (Recommended)

1. Install jsPDF: `npm install jspdf`
2. Create `generatePDFReport()` function in `reportExport.ts`
3. Add "Download as PDF" button to ExportButton component
4. Test with sample progress data

### Phase 2: Enhanced Reports (Future)

1. Add chart support using lightweight charting (e.g., Chart.js or custom SVG)
2. Implement html2canvas for complex layouts
3. Add branding/logo support

---

## Alternative: Stay Text-Only

If PDF is not critical, the current text-based approach is valid:

- Works on all devices
- Zero dependency overhead
- Shareable via WhatsApp/email
- Printable from text editor

**Consider keeping text export as fallback option.**

---

## References

- [jsPDF Documentation](https://jspdf.github.io/)
- [pdf-lib Documentation](https://pdf-lib.js.org/)
- [pdfmake Documentation](https://pdfmake.org/)
- [Client-Side PDF Generation Guide](https://forem.com/joyfill/how-to-generate-pdfs-in-the-browser-with-javascript-no-server-needed-3jg1)

---

## Decision Needed

**Before implementation, confirm:**

1. Is PDF output a requirement, or is text export sufficient?
2. What level of visual formatting is needed?
3. Is bundle size a concern (vs. adding ~300KB)?

**Suggested next step**: If PDF is required, proceed with jsPDF implementation in Phase 1.
