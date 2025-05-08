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
  showForm: boolean;
  isEditing: boolean;
  designToEdit: Design | null;
  onSuccess: () => void;
}

const DesignFormSection: React.FC<DesignFormSectionProps> = ({
  showForm,
  isEditing,
  designToEdit,
  onSuccess,
}) => {
  if (!showForm) return null;

  return (
    <div className="mb-8 bg-gray-900/50 border border-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">
        {isEditing ? 'Edit Design' : 'Create New Design'}
      </h2>
      <DesignForm
        onSuccess={onSuccess}
        designToEdit={designToEdit || null}
        isEditing={isEditing}
      />
    </div>
  );
};

export default DesignFormSection;
