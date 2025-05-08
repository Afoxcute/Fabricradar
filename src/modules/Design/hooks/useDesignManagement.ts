import { useState } from 'react';
import { Design } from '../types/design';

const useDesignManagement = () => {
  const [showForm, setShowForm] = useState(false);
  const [designToEdit, setDesignToEdit] = useState<Design | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleDesignSuccess = () => {
    setShowForm(false);
    setIsEditing(false);
    setDesignToEdit(null);
  };

  const handleEditDesign = (design: Design) => {
    setDesignToEdit(design);
    setIsEditing(true);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setIsEditing(false);
    setDesignToEdit(null);
  };

  const handleAddNewDesign = () => {
    setIsEditing(false);
    setDesignToEdit(null);
    setShowForm(true);
  };

  return {
    showForm,
    designToEdit,
    isEditing,
    handleDesignSuccess,
    handleEditDesign,
    handleCancelForm,
    handleAddNewDesign,
  };
};

export default useDesignManagement;
