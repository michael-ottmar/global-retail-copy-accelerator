import type { ParsedComponent, FigmaNode } from '../types';
import type React from 'react';

export function generateCSS(component: ParsedComponent): React.CSSProperties {
  const styles: React.CSSProperties = {};
  
  // This will be expanded based on actual Figma node properties
  // For now, returning basic styles for testing
  
  if (component.type === 'container') {
    styles.display = 'flex';
    styles.flexDirection = 'column';
    styles.position = 'relative';
  }
  
  if (component.type === 'text') {
    styles.whiteSpace = 'pre-wrap';
  }
  
  return styles;
}

export function figmaNodeToCSS(node: FigmaNode): React.CSSProperties {
  const styles: React.CSSProperties = {};
  
  // Position and size
  if (node.absoluteBoundingBox) {
    styles.width = `${node.absoluteBoundingBox.width}px`;
    styles.height = `${node.absoluteBoundingBox.height}px`;
  }
  
  // Layout mode (Auto Layout)
  if (node.layoutMode) {
    styles.display = 'flex';
    
    if (node.layoutMode === 'HORIZONTAL') {
      styles.flexDirection = 'row';
    } else if (node.layoutMode === 'VERTICAL') {
      styles.flexDirection = 'column';
    }
    
    // Item spacing (gap)
    if (node.itemSpacing) {
      styles.gap = `${node.itemSpacing}px`;
    }
    
    // Padding
    if (node.paddingLeft !== undefined) styles.paddingLeft = `${node.paddingLeft}px`;
    if (node.paddingRight !== undefined) styles.paddingRight = `${node.paddingRight}px`;
    if (node.paddingTop !== undefined) styles.paddingTop = `${node.paddingTop}px`;
    if (node.paddingBottom !== undefined) styles.paddingBottom = `${node.paddingBottom}px`;
    
    // Alignment
    if (node.primaryAxisAlignItems) {
      const alignMap = {
        'MIN': 'flex-start',
        'CENTER': 'center',
        'MAX': 'flex-end',
        'SPACE_BETWEEN': 'space-between'
      };
      styles.justifyContent = alignMap[node.primaryAxisAlignItems] || 'flex-start';
    }
    
    if (node.counterAxisAlignItems) {
      const alignMap = {
        'MIN': 'flex-start',
        'CENTER': 'center',
        'MAX': 'flex-end'
      };
      styles.alignItems = alignMap[node.counterAxisAlignItems] || 'stretch';
    }
  }
  
  // Constraints
  if (node.constraints) {
    // Horizontal constraints
    if (node.constraints.horizontal === 'LEFT_RIGHT' || node.constraints.horizontal === 'SCALE') {
      styles.width = '100%';
    } else if (node.constraints.horizontal === 'CENTER') {
      styles.marginLeft = 'auto';
      styles.marginRight = 'auto';
    }
    
    // Vertical constraints
    if (node.constraints.vertical === 'TOP_BOTTOM' || node.constraints.vertical === 'SCALE') {
      styles.height = '100%';
    } else if (node.constraints.vertical === 'CENTER') {
      styles.marginTop = 'auto';
      styles.marginBottom = 'auto';
    }
  }
  
  // Layout grow
  if (node.layoutGrow) {
    styles.flexGrow = node.layoutGrow;
  }
  
  // Fills (background)
  if (node.fills && node.fills.length > 0) {
    const fill = node.fills[0]; // Take first fill for now
    if (fill.type === 'SOLID' && fill.color) {
      const { r, g, b, a } = fill.color;
      styles.backgroundColor = `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`;
    }
  }
  
  // Strokes (border)
  if (node.strokes && node.strokes.length > 0 && node.strokeWeight) {
    const stroke = node.strokes[0];
    if (stroke.type === 'SOLID' && stroke.color) {
      const { r, g, b, a } = stroke.color;
      styles.border = `${node.strokeWeight}px solid rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`;
    }
  }
  
  // Corner radius
  if (node.cornerRadius) {
    styles.borderRadius = `${node.cornerRadius}px`;
  }
  
  // Effects (shadows, blur)
  if (node.effects && node.effects.length > 0) {
    const shadows = node.effects
      .filter(effect => effect.type === 'DROP_SHADOW')
      .map(effect => {
        if (effect.color && effect.offset && effect.radius) {
          const { r, g, b, a } = effect.color;
          return `${effect.offset.x}px ${effect.offset.y}px ${effect.radius}px rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`;
        }
        return '';
      })
      .filter(Boolean);
    
    if (shadows.length > 0) {
      styles.boxShadow = shadows.join(', ');
    }
  }
  
  // Opacity
  if (node.opacity !== undefined && node.opacity < 1) {
    styles.opacity = node.opacity;
  }
  
  // Text styles
  if (node.style) {
    const textStyle = node.style;
    
    if (textStyle.fontFamily) styles.fontFamily = textStyle.fontFamily;
    if (textStyle.fontSize) styles.fontSize = `${textStyle.fontSize}px`;
    if (textStyle.fontWeight) styles.fontWeight = textStyle.fontWeight;
    if (textStyle.letterSpacing) styles.letterSpacing = `${textStyle.letterSpacing}px`;
    
    if (textStyle.lineHeight) {
      if (textStyle.lineHeight.unit === 'PIXELS') {
        styles.lineHeight = `${textStyle.lineHeight.value}px`;
      } else if (textStyle.lineHeight.unit === 'PERCENT') {
        styles.lineHeight = `${textStyle.lineHeight.value}%`;
      }
    }
    
    if (textStyle.textAlignHorizontal) {
      const alignMap = {
        'LEFT': 'left',
        'CENTER': 'center',
        'RIGHT': 'right',
        'JUSTIFIED': 'justify'
      };
      styles.textAlign = alignMap[textStyle.textAlignHorizontal] as any;
    }
  }
  
  return styles;
}