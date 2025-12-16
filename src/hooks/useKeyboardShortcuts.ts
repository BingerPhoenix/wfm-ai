import { useEffect } from 'react';
import { useForecastStore } from '../store/forecastStore';

interface KeyboardShortcutsProps {
  onResetDemo?: () => void;
  onToggleDemo?: () => void;
}

export const useKeyboardShortcuts = ({ onResetDemo, onToggleDemo }: KeyboardShortcutsProps = {}) => {
  const { setDeflectionRate, clearChat, setSelectedDay } = useForecastStore();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle shortcuts when not typing in inputs
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey
      ) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case 'r':
          // Reset to baseline state
          if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
            event.preventDefault();
            setDeflectionRate(0.25); // Reset to 25% baseline
            setSelectedDay('tuesday' as any); // Show Tuesday gaps
            if (onResetDemo) onResetDemo();

            // Show notification
            if (window.location.hostname === 'localhost') {
              console.log('🔄 Demo reset to baseline (25% deflection, Tuesday view)');
            }
          }
          break;

        case 'd':
          // Toggle demo mode
          if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
            event.preventDefault();

            if (onToggleDemo) {
              onToggleDemo();
            } else {
              // Default toggle behavior
              const urlParams = new URLSearchParams(window.location.search);
              const isDemo = urlParams.get('demo') === 'true';

              if (isDemo) {
                urlParams.delete('demo');
              } else {
                urlParams.set('demo', 'true');
              }

              const newUrl = `${window.location.pathname}${urlParams.toString() ? '?' + urlParams.toString() : ''}`;
              window.location.href = newUrl;
            }

            if (window.location.hostname === 'localhost') {
              console.log('🎯 Demo mode toggled');
            }
          }
          break;

        case 's':
          // Scenario mode - jump to 35% deflection
          if (event.shiftKey && (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost')) {
            event.preventDefault();
            setDeflectionRate(0.35);

            if (window.location.hostname === 'localhost') {
              console.log('📊 Scenario mode: 35% deflection');
            }
          }
          break;

        case '?':
          // Show help for shortcuts (dev only)
          if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
            event.preventDefault();
            console.log(`
🎮 WFM.ai Demo Shortcuts:
  R - Reset to baseline (25% deflection, Tuesday view)
  D - Toggle demo mode
  Shift+S - Scenario mode (35% deflection)
  ? - Show this help

💡 Shortcuts only work during development/localhost
            `);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [setDeflectionRate, setSelectedDay, clearChat, onResetDemo, onToggleDemo]);
};