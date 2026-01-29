/**
 * Style Test Component
 * 
 * This component displays all the design system elements
 * so you can verify borders, colors, and typography visually.
 * 
 * Access at: http://localhost:5173/style-test (after adding route)
 * Or import into any page for testing
 */

export function StyleTest() {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-h1">Design System Test</h1>
      
      {/* Color Swatches */}
      <section>
        <h2 className="text-h2">Background Colors</h2>
        <div className="flex gap-4 flex-wrap">
          <div className="p-4 bg-bg-primary border-2 border-border-strong rounded-lg">
            <p className="text-primary font-bold">bg-primary</p>
            <p className="text-small">#FDF8F3</p>
          </div>
          <div className="p-4 bg-bg-secondary border-2 border-border-strong rounded-lg">
            <p className="text-primary font-bold">bg-secondary</p>
            <p className="text-small">#E8F4F8</p>
          </div>
          <div className="p-4 bg-bg-tertiary border-2 border-border-strong rounded-lg">
            <p className="text-primary font-bold">bg-tertiary</p>
            <p className="text-small">#F5F0E8</p>
          </div>
        </div>
      </section>

      {/* Text Colors */}
      <section>
        <h2 className="text-h2">Text Colors</h2>
        <div className="space-y-2 bg-white p-4 rounded-lg border-2 border-border">
          <p className="text-primary text-lg">text-primary: #1F2937 (should be very dark/clear)</p>
          <p className="text-secondary text-lg">text-secondary: #4B5563 (should be clearly readable)</p>
          <p className="text-muted text-lg">text-muted: #9CA3AF (should be lighter)</p>
        </div>
      </section>

      {/* Border Test */}
      <section>
        <h2 className="text-h2">Border Test</h2>
        <p className="mb-4">Each box below should have a visible 2px border:</p>
        <div className="flex gap-4 flex-wrap">
          <div className="p-6 bg-white border-2 border-border rounded-lg">
            <p className="text-primary font-bold">2px border (default)</p>
            <p className="text-secondary">Should be visible</p>
          </div>
          <div className="p-6 bg-white border-2 border-border-strong rounded-lg">
            <p className="text-primary font-bold">2px border-strong</p>
            <p className="text-secondary">Should be darker/more visible</p>
          </div>
          <div className="p-6 bg-white border-2 border-border-focus rounded-lg">
            <p className="text-primary font-bold">2px border-focus</p>
            <p className="text-secondary">Should be blue</p>
          </div>
        </div>
      </section>

      {/* Buttons */}
      <section>
        <h2 className="text-h2">Buttons</h2>
        <div className="flex gap-4 flex-wrap">
          <button className="btn btn-primary">Primary Button</button>
          <button className="btn btn-secondary">Secondary Button</button>
          <button className="btn btn-success">Success Button</button>
          <button className="btn btn-ghost">Ghost Button</button>
        </div>
      </section>

      {/* Cards */}
      <section>
        <h2 className="text-h2">Cards (with 2px borders)</h2>
        <div className="flex gap-4 flex-wrap">
          <div className="card">
            <h3 className="text-h3">Card Title</h3>
            <p>This card should have a sharp 2px border</p>
          </div>
          <div className="card card-hover">
            <h3 className="text-h3">Hover Card</h3>
            <p>Hover to see shadow effect</p>
          </div>
        </div>
      </section>

      {/* Typography */}
      <section>
        <h2 className="text-h2">Typography</h2>
        <div className="space-y-4 bg-white p-6 rounded-lg border-2 border-border">
          <h1 className="text-display">Display (6rem)</h1>
          <h1 className="text-h1">Heading 1 (2rem, weight 800)</h1>
          <h2 className="text-h2">Heading 2 (1.5rem, weight 800)</h2>
          <h3 className="text-h3">Heading 3 (1.25rem, weight 800)</h3>
          <p className="text-body">Body text (1.125rem, weight 600) - should be bold and clear</p>
          <p className="text-small">Small text (1rem, weight 600)</p>
        </div>
      </section>

      {/* Touch Targets */}
      <section>
        <h2 className="text-h2">Touch Targets (60px minimum)</h2>
        <div className="flex gap-4">
          <button className="btn btn-primary touch-target w-16 h-16 p-0 flex items-center justify-center text-2xl">
            🎯
          </button>
          <button className="btn btn-secondary touch-target w-16 h-16 p-0 flex items-center justify-center text-2xl">
            👆
          </button>
        </div>
        <p className="text-secondary mt-2">Above buttons should be 60x60px minimum</p>
      </section>
    </div>
  );
}

export default StyleTest;
