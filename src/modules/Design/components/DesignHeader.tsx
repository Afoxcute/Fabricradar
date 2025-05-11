import { PlusCircle, XCircle } from 'lucide-react';

interface DesignHeaderProps {
  showForm: boolean;
  isEditing: boolean;
  onAddNewDesign: () => void;
  onCancelForm: () => void;
}

const DesignHeader: React.FC<DesignHeaderProps> = ({
  showForm,
  isEditing,
  onAddNewDesign,
  onCancelForm,
}) => {
  return (
    <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
      <div>
        <h1 className="md:text-3xl text-2xl font-bold text-white">
          My Designs
        </h1>
        <p className="text-gray-400 mt-2">
          Create and manage your design portfolio
        </p>
      </div>

      <button
        onClick={showForm ? onCancelForm : onAddNewDesign}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          showForm
            ? 'bg-red-900/30 text-red-500 hover:bg-red-900/50'
            : 'bg-cyan-900/30 text-cyan-500 hover:bg-cyan-800/50'
        }`}
      >
        {showForm ? (
          <>
            <XCircle size={18} />
            <span>Cancel {isEditing ? 'Edit' : 'New Design'}</span>
          </>
        ) : (
          <>
            <PlusCircle size={18} />
            <span>Add New Design</span>
          </>
        )}
      </button>
    </div>
  );
};

export default DesignHeader;
