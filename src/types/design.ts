import { JsonValue } from './json';

/**
 * Interface representing a design in the application.
 */
export interface Design {
  id: number;
  title: string;
  description: string;
  price: number;
  imageUrl: string | null;
  images?: JsonValue | null;
  averageTimeline: string;
  tailorId: number;
  createdAt?: Date;
  updatedAt?: Date;
  tailor?: {
    id: number;
    firstName: string | null;
    lastName: string | null;
  };
}

/**
 * Helper function to get the best display image from a design
 * @param design The design object
 * @returns The URL of the image to display
 */
export function getDesignDisplayImage(design: Design): string {
  // Default fallback image
  let imageUrl: string = '/product1.jpeg';
  
  // Check if images is an array with items
  if (design.images && Array.isArray(design.images) && design.images.length > 0) {
    imageUrl = design.images[0] as string;
  } 
  // Otherwise use imageUrl if available
  else if (design.imageUrl) {
    imageUrl = design.imageUrl;
  }
  
  return imageUrl;
}

/**
 * Helper function to get a formatted tailor name from a design
 * @param design The design object
 * @returns The formatted tailor name
 */
export function getTailorName(design: Design): string {
  return design.tailor
    ? `${design.tailor.firstName || ''} ${design.tailor.lastName || ''}`.trim() || 'Anonymous Tailor'
    : 'Anonymous Tailor';
} 