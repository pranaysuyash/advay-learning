import type { PropsWithChildren, ReactNode } from 'react';

type Props = PropsWithChildren<{
  title: ReactNode;
  description?: ReactNode;
  className?: string;
}>;

export function GameSetupCard(props: Props) {
  const { title, description, className, children } = props;

  return (
    <section
      className={`bg-white border border-border rounded-xl p-6 shadow-soft ${className ?? ''}`}
    >
      <header className='mb-3'>
        <div className='text-sm font-medium text-text-secondary'>{title}</div>
        {description ? (
          <div className='text-xs text-text-secondary/80 mt-1'>
            {description}
          </div>
        ) : null}
      </header>
      {children}
    </section>
  );
}

