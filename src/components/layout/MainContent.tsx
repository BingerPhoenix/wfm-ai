import React from 'react';

interface MainContentProps {
  children: React.ReactNode;
  className?: string;
  layout?: 'default' | 'copilot';
}

export const MainContent: React.FC<MainContentProps> = ({
  children,
  className = '',
  layout = 'default'
}) => {
  if (layout === 'copilot') {
    // Responsive layout:
    // Mobile: Stack vertically
    // Tablet: Side-by-side with narrower chart
    // Desktop: Optimal 60/40 split
    return (
      <main className={`flex-1 bg-gray-900 ${className}`}>
        <div className="h-full flex flex-col lg:grid lg:grid-cols-[60%_40%] xl:grid-cols-[60%_40%] gap-4 p-3 sm:p-4 md:p-6">
          {children}
        </div>
      </main>
    );
  }

  // Default layout
  return (
    <main className={`flex-1 overflow-auto p-6 bg-gray-100 ${className}`}>
      {children}
    </main>
  );
};