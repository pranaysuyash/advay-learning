import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { UIIcon } from './ui/Icon';

/**
 * Style Test Component
 *
 * Visual sanity check for the UI token system and canonical components.
 * Route is wired at `/style-test`.
 */
export function StyleTest() {
  return (
    <div className="p-8 space-y-10">
      <header>
        <h1 className="text-h1 text-text-primary">Design System Test</h1>
        <p className="text-text-secondary mt-2">
          Verify tokens, contrast, focus states, and touch targets.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-h2 text-text-primary">Background Tokens</h2>
        <div className="flex gap-4 flex-wrap">
          <Card padding="sm" className="w-56 bg-bg-primary">
            <p className="text-text-primary font-bold">bg-bg-primary</p>
            <p className="text-text-secondary text-sm">Used as app base</p>
          </Card>
          <Card padding="sm" className="w-56 bg-bg-secondary">
            <p className="text-text-primary font-bold">bg-bg-secondary</p>
            <p className="text-text-secondary text-sm">Soft contrast sections</p>
          </Card>
          <Card padding="sm" className="w-56 bg-bg-tertiary">
            <p className="text-text-primary font-bold">bg-bg-tertiary</p>
            <p className="text-text-secondary text-sm">Pills, icon chips</p>
          </Card>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-h2 text-text-primary">Text Tokens</h2>
        <Card>
          <p className="text-text-primary text-lg">
            text-text-primary (primary reading)
          </p>
          <p className="text-text-secondary text-lg">
            text-text-secondary (supporting copy)
          </p>
          <p className="text-text-muted text-lg">
            text-text-muted (quiet metadata)
          </p>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-h2 text-text-primary">Buttons (Canonical)</h2>
        <div className="flex gap-4 flex-wrap items-center">
          <Button variant="primary" icon="sparkles">Primary</Button>
          <Button variant="secondary" icon="letters">Secondary</Button>
          <Button variant="success" icon="check">Success</Button>
          <Button variant="ghost" icon="target">Ghost</Button>
          <Button variant="danger" icon="warning">Danger</Button>
          <Button variant="primary" size="lg" fullWidth className="max-w-xs">
            Large (Kid-friendly)
          </Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-h2 text-text-primary">Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <h3 className="text-h3 text-text-primary">Default Card</h3>
            <p className="text-text-secondary">
              Border + shadow should be consistent across the app.
            </p>
          </Card>
          <Card hover>
            <h3 className="text-h3 text-text-primary">Hover Card</h3>
            <p className="text-text-secondary">Hover elevation should feel gentle.</p>
          </Card>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-h2 text-text-primary">Touch Targets (60px)</h2>
        <div className="flex gap-4 flex-wrap items-center">
          <button
            type="button"
            className="touch-target w-16 h-16 bg-pip-orange text-white rounded-2xl shadow-soft flex items-center justify-center text-2xl"
            aria-label="Touch target example 1"
          >
            🎯
          </button>
          <button
            type="button"
            className="touch-target w-16 h-16 bg-bg-tertiary text-text-primary border border-border rounded-2xl shadow-soft flex items-center justify-center text-2xl"
            aria-label="Touch target example 2"
          >
            👆
          </button>
          <div className="text-text-secondary text-sm">
            Buttons should be easy for kids to hit.
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-h2 text-text-primary">Icons</h2>
        <div className="flex gap-3 flex-wrap items-center">
          <UIIcon name="home" size={24} className="text-text-secondary" />
          <UIIcon name="hand" size={24} className="text-vision-blue" />
          <UIIcon name="letters" size={24} className="text-pip-orange" />
          <UIIcon name="warning" size={24} className="text-text-error" />
          <UIIcon name="check" size={24} className="text-text-success" />
        </div>
      </section>
    </div>
  );
}

export default StyleTest;
