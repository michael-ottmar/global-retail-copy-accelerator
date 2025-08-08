import type { FigmaNode, ParsedComponent } from '../types';

export function parseFrameToComponents(frame: FigmaNode): ParsedComponent[] {
  const components: ParsedComponent[] = [];
  
  const parseNode = (node: FigmaNode, depth: number = 0): ParsedComponent => {
    const component: ParsedComponent = {
      id: `component-${node.id}`,
      figmaId: node.id,
      name: node.name,
      type: determineComponentType(node),
      styles: {},
      children: [],
      textContent: node.characters,
      variablePath: undefined
    };

    // Parse children recursively
    if (node.children) {
      component.children = node.children.map(child => parseNode(child, depth + 1));
    }

    // Generate variable path based on naming convention
    if (component.type === 'text') {
      component.variablePath = generateVariablePath(frame.name, node.name);
    }

    return component;
  };

  // Parse the frame itself as root component
  if (frame.children) {
    frame.children.forEach(child => {
      components.push(parseNode(child));
    });
  }

  return components;
}

function determineComponentType(node: FigmaNode): ParsedComponent['type'] {
  switch (node.type) {
    case 'TEXT':
      return 'text';
    case 'RECTANGLE':
      // Check if it has image fills
      if (node.fills?.some(fill => fill.type === 'IMAGE')) {
        return 'image';
      }
      return 'shape';
    case 'FRAME':
    case 'GROUP':
    case 'COMPONENT':
    case 'INSTANCE':
      return 'container';
    default:
      return 'shape';
  }
}

function generateVariablePath(frameName: string, nodeName: string): string | undefined {
  // Parse frame name for deliverable type
  const frameNameLower = frameName.toLowerCase();
  const deliverableType = frameNameLower.includes('pdp') ? 'pdp' :
                          frameNameLower.includes('banner') ? 'banner' :
                          frameNameLower.includes('gallery') ? 'gallery' :
                          frameNameLower.includes('module') ? 'module' :
                          frameNameLower.includes('crm') ? 'crm' : null;

  if (!deliverableType) return undefined;

  // Parse node name for field type
  const nodeNameLower = nodeName.toLowerCase();
  const fieldType = nodeNameLower.includes('headline') ? 'headline' :
                   nodeNameLower.includes('body') ? 'body' :
                   nodeNameLower.includes('legal') ? 'legal' :
                   nodeNameLower.includes('feature') ? 'feature' :
                   nodeNameLower.includes('cta') ? 'cta' : null;

  if (!fieldType) return undefined;

  // Extract asset identifier (e.g., "gallery_image_1" from frame name)
  const assetMatch = frameName.match(/(\w+_\w+_\d+)/);
  const assetIdentifier = assetMatch ? assetMatch[0].toLowerCase() : deliverableType;

  return `${deliverableType}/${assetIdentifier}/${fieldType}`;
}