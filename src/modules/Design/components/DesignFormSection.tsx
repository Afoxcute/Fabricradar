import DesignForm from '@/components/design/design-form';
// import { Design } from '@/types/design';

interface Design {
  id: number;
  title: string;
  description: string;
  price: number;
  imageUrl: string | null;
  averageTimeline: string;
  tailorId: number;
}

interface DesignFormSectionProps {
  isEditing: boolean;
  designToEdit: Design | null;
  onSuccess: () => void;
}

const DesignFormSection: React.FC<DesignFormSectionProps> = ({
  isEditing,
  designToEdit,
  onSuccess,
}) => {
  return (
    <DesignForm
      onSuccess={onSuccess}
      designToEdit={designToEdit || null}
      isEditing={isEditing}
    />
  );
};

export default DesignFormSection;
