export interface Design {
  id: number;
  title: string;
  description: string;
  price: number;
  imageUrl: string | null;
  averageTimeline: string;
  tailorId: number;
}

export interface DesignFormProps {
  onSuccess: () => void;
  designToEdit: Design | null;
  isEditing: boolean;
}

export interface DesignListProps {
  tailorId: number;
  showActions: boolean;
  onEditDesign?: (design: Design) => void;
}
