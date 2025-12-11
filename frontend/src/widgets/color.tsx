import { StrictMode, useCallback, useState } from 'react';
import { createRoot } from 'react-dom/client';
import cssContent from '../styles.css?inline';
import { FaCopy, FaCheck, FaHeart, FaRegHeart } from 'react-icons/fa';
import {
  useOpenAiGlobal,
  ButtonSpinner,
  LoadingSpinner,
  callTool,
} from './shared/index.js';

// Types
interface ColorInfo {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  name?: string;
}

interface ToolOutput {
  success: boolean;
  colors: ColorInfo[];
  paletteType?: string;
}

// Hooks
function useToolOutput(): ToolOutput | null {
  return useOpenAiGlobal('toolOutput');
}

function useTheme() {
  return useOpenAiGlobal('theme');
}

// Helper functions
function getContrastColor(hex: string): string {
  // Convert hex to RGB
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  }
  
  // Fallback for older browsers
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  
  try {
    document.execCommand('copy');
    textArea.remove();
    return Promise.resolve();
  } catch (err) {
    textArea.remove();
    return Promise.reject(err);
  }
}

// Components
interface ColorSwatchProps {
  color: ColorInfo;
  size?: 'small' | 'medium' | 'large';
}

function ColorSwatch({ color, size = 'medium' }: ColorSwatchProps) {
  const [copiedValue, setCopiedValue] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const theme = useTheme();
  const isDark = theme === 'dark';

  const handleCopy = useCallback(async (value: string, label: string) => {
    try {
      await copyToClipboard(value);
      setCopiedValue(label);
      setTimeout(() => setCopiedValue(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

  const handleSaveFavorite = useCallback(async () => {
    setIsSaving(true);
    try {
      await callTool('save_favorite_color', {
        color: color.hex,
        name: color.name,
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save favorite:', err);
    } finally {
      setIsSaving(false);
    }
  }, [color]);

  const sizeClasses = {
    small: 'w-20 h-20 text-xs',
    medium: 'w-32 h-32 text-sm',
    large: 'w-48 h-48 text-base',
  };

  const textColor = getContrastColor(color.hex);

  return (
    <div
      className={`${sizeClasses[size]} rounded-lg shadow-lg flex flex-col items-center justify-center p-3 relative group transition-transform hover:scale-105`}
      style={{ backgroundColor: color.hex }}
    >
      {/* Color name */}
      {color.name && (
        <div
          className="font-semibold mb-1 text-center"
          style={{ color: textColor }}
        >
          {color.name}
        </div>
      )}

      {/* HEX value */}
      <button
        onClick={() => handleCopy(color.hex, 'HEX')}
        className="font-mono font-bold mb-1 hover:underline cursor-pointer"
        style={{ color: textColor }}
        title="Click to copy HEX"
      >
        {color.hex}
        {copiedValue === 'HEX' && (
          <FaCheck className="inline ml-1 text-xs" />
        )}
      </button>

      {/* RGB value */}
      <button
        onClick={() =>
          handleCopy(
            `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`,
            'RGB'
          )
        }
        className="font-mono text-xs opacity-80 hover:opacity-100 hover:underline cursor-pointer"
        style={{ color: textColor }}
        title="Click to copy RGB"
      >
        rgb({color.rgb.r}, {color.rgb.g}, {color.rgb.b})
        {copiedValue === 'RGB' && (
          <FaCheck className="inline ml-1 text-xs" />
        )}
      </button>

      {/* HSL value */}
      <button
        onClick={() =>
          handleCopy(
            `hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`,
            'HSL'
          )
        }
        className="font-mono text-xs opacity-80 hover:opacity-100 hover:underline cursor-pointer"
        style={{ color: textColor }}
        title="Click to copy HSL"
      >
        hsl({color.hsl.h}, {color.hsl.s}%, {color.hsl.l}%)
        {copiedValue === 'HSL' && (
          <FaCheck className="inline ml-1 text-xs" />
        )}
      </button>

      {/* Save to favorites button */}
      <button
        onClick={handleSaveFavorite}
        disabled={isSaving || isSaved}
        className="absolute top-2 right-2 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          backgroundColor: textColor === '#000000' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)',
          color: textColor,
        }}
        title={isSaved ? 'Saved to favorites!' : 'Save to favorites'}
      >
        {isSaving ? (
          <ButtonSpinner />
        ) : isSaved ? (
          <FaHeart />
        ) : (
          <FaRegHeart />
        )}
      </button>
    </div>
  );
}

function ColorPalette() {
  const toolOutput = useToolOutput();
  const theme = useTheme();
  const isDark = theme === 'dark';

  if (!toolOutput || !toolOutput.colors || toolOutput.colors.length === 0) {
    return (
      <div className={`p-8 text-center ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
        <LoadingSpinner />
        <p className="mt-4">Loading colors...</p>
      </div>
    );
  }

  const { colors, paletteType } = toolOutput;

  const paletteLabels: Record<string, string> = {
    single: 'Color',
    complementary: 'Complementary Colors',
    analogous: 'Analogous Colors',
    triadic: 'Triadic Colors',
    monochromatic: 'Monochromatic Palette',
    tetradic: 'Tetradic Colors',
    random: 'Random Colors',
    favorites: 'Favorite Colors',
  };

  return (
    <div className={`p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {/* Header */}
      {paletteType && (
        <h2 className="text-2xl font-bold mb-6 text-center">
          {paletteLabels[paletteType] || 'Color Palette'}
        </h2>
      )}

      {/* Color grid */}
      <div
        className={`grid gap-4 justify-items-center ${
          colors.length === 1
            ? 'grid-cols-1'
            : colors.length === 2
            ? 'grid-cols-2'
            : colors.length <= 4
            ? 'grid-cols-2 md:grid-cols-4'
            : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5'
        }`}
      >
        {colors.map((color, index) => (
          <ColorSwatch
            key={`${color.hex}-${index}`}
            color={color}
            size={colors.length === 1 ? 'large' : colors.length <= 3 ? 'medium' : 'small'}
          />
        ))}
      </div>

      {/* Tips */}
      <div className={`mt-6 text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        <p>Click any color value to copy it to clipboard</p>
        <p className="mt-1">Hover over a color to save it to favorites</p>
      </div>
    </div>
  );
}

// Widget root component
function ColorWidget() {
  return (
    <StrictMode>
      <style>{cssContent}</style>
      <ColorPalette />
    </StrictMode>
  );
}

// Mount the widget
const rootElement = document.getElementById('color-widget-root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<ColorWidget />);
} else {
  console.error('Color widget root element not found');
}

