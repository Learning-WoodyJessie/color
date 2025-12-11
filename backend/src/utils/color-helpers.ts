/**
 * Color utility functions for color conversions and operations
 */

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface HSL {
  h: number;
  s: number;
  l: number;
}

export interface ColorInfo {
  hex: string;
  rgb: RGB;
  hsl: HSL;
  name?: string;
}

/**
 * Convert HEX to RGB
 */
export function hexToRgb(hex: string): RGB {
  // Remove # if present
  hex = hex.replace(/^#/, '');
  
  // Handle shorthand hex (e.g., #FFF)
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }
  
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return { r, g, b };
}

/**
 * Convert RGB to HEX
 */
export function rgbToHex(rgb: RGB): string {
  const toHex = (n: number) => {
    const hex = Math.round(n).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`.toUpperCase();
}

/**
 * Convert RGB to HSL
 */
export function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (diff !== 0) {
    s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min);
    
    switch (max) {
      case r:
        h = ((g - b) / diff + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / diff + 2) / 6;
        break;
      case b:
        h = ((r - g) / diff + 4) / 6;
        break;
    }
  }
  
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

/**
 * Convert HSL to RGB
 */
export function hslToRgb(hsl: HSL): RGB {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;
  
  let r, g, b;
  
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

/**
 * Parse color string (hex, rgb, hsl) and convert to ColorInfo
 */
export function parseColor(color: string): ColorInfo {
  color = color.trim();
  
  // HEX color
  if (color.startsWith('#')) {
    const rgb = hexToRgb(color);
    const hsl = rgbToHsl(rgb);
    return { hex: color.toUpperCase(), rgb, hsl };
  }
  
  // RGB color
  const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/i);
  if (rgbMatch) {
    const rgb = { r: parseInt(rgbMatch[1]), g: parseInt(rgbMatch[2]), b: parseInt(rgbMatch[3]) };
    const hex = rgbToHex(rgb);
    const hsl = rgbToHsl(rgb);
    return { hex, rgb, hsl };
  }
  
  // HSL color
  const hslMatch = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/i);
  if (hslMatch) {
    const hsl = { h: parseInt(hslMatch[1]), s: parseInt(hslMatch[2]), l: parseInt(hslMatch[3]) };
    const rgb = hslToRgb(hsl);
    const hex = rgbToHex(rgb);
    return { hex, rgb, hsl };
  }
  
  // Try to parse as hex without #
  if (/^[0-9A-F]{6}$/i.test(color)) {
    return parseColor('#' + color);
  }
  
  throw new Error('Invalid color format. Use HEX (#RRGGBB), RGB (rgb(r,g,b)), or HSL (hsl(h,s%,l%))');
}

/**
 * Generate random color
 */
export function generateRandomColor(): ColorInfo {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  const rgb = { r, g, b };
  const hex = rgbToHex(rgb);
  const hsl = rgbToHsl(rgb);
  return { hex, rgb, hsl };
}

/**
 * Generate complementary color (opposite on color wheel)
 */
export function getComplementary(color: ColorInfo): ColorInfo {
  const hsl = { ...color.hsl, h: (color.hsl.h + 180) % 360 };
  const rgb = hslToRgb(hsl);
  const hex = rgbToHex(rgb);
  return { hex, rgb, hsl };
}

/**
 * Generate analogous colors (adjacent on color wheel)
 */
export function getAnalogous(color: ColorInfo): ColorInfo[] {
  const colors: ColorInfo[] = [];
  const angles = [-30, 0, 30];
  
  for (const angle of angles) {
    const hsl = { ...color.hsl, h: (color.hsl.h + angle + 360) % 360 };
    const rgb = hslToRgb(hsl);
    const hex = rgbToHex(rgb);
    colors.push({ hex, rgb, hsl });
  }
  
  return colors;
}

/**
 * Generate triadic colors (120° apart on color wheel)
 */
export function getTriadic(color: ColorInfo): ColorInfo[] {
  const colors: ColorInfo[] = [];
  const angles = [0, 120, 240];
  
  for (const angle of angles) {
    const hsl = { ...color.hsl, h: (color.hsl.h + angle) % 360 };
    const rgb = hslToRgb(hsl);
    const hex = rgbToHex(rgb);
    colors.push({ hex, rgb, hsl });
  }
  
  return colors;
}

/**
 * Generate monochromatic palette (same hue, different lightness)
 */
export function getMonochromatic(color: ColorInfo, count: number = 5): ColorInfo[] {
  const colors: ColorInfo[] = [];
  const step = 80 / (count - 1); // From 10% to 90% lightness
  
  for (let i = 0; i < count; i++) {
    const hsl = { ...color.hsl, l: Math.round(10 + step * i) };
    const rgb = hslToRgb(hsl);
    const hex = rgbToHex(rgb);
    colors.push({ hex, rgb, hsl });
  }
  
  return colors;
}

/**
 * Generate tetradic/square palette (90° apart)
 */
export function getTetradic(color: ColorInfo): ColorInfo[] {
  const colors: ColorInfo[] = [];
  const angles = [0, 90, 180, 270];
  
  for (const angle of angles) {
    const hsl = { ...color.hsl, h: (color.hsl.h + angle) % 360 };
    const rgb = hslToRgb(hsl);
    const hex = rgbToHex(rgb);
    colors.push({ hex, rgb, hsl });
  }
  
  return colors;
}

/**
 * Get basic color name (simplified)
 */
export function getColorName(color: ColorInfo): string {
  const { h, s, l } = color.hsl;
  
  // Achromatic colors
  if (s < 10) {
    if (l < 20) return 'Black';
    if (l < 40) return 'Dark Gray';
    if (l < 60) return 'Gray';
    if (l < 80) return 'Light Gray';
    return 'White';
  }
  
  // Chromatic colors
  const hueNames = [
    { max: 15, name: 'Red' },
    { max: 45, name: 'Orange' },
    { max: 70, name: 'Yellow' },
    { max: 150, name: 'Green' },
    { max: 210, name: 'Cyan' },
    { max: 250, name: 'Blue' },
    { max: 290, name: 'Purple' },
    { max: 330, name: 'Magenta' },
    { max: 360, name: 'Red' }
  ];
  
  const hueName = hueNames.find(range => h <= range.max)?.name || 'Red';
  
  // Add lightness/saturation modifiers
  let prefix = '';
  if (l < 30) prefix = 'Dark ';
  else if (l > 70) prefix = 'Light ';
  else if (s < 40) prefix = 'Pale ';
  else if (s > 80) prefix = 'Vivid ';
  
  return prefix + hueName;
}

