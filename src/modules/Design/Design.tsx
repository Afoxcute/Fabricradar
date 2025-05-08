'use client';

import React from 'react';
import { useAuth } from '@/providers/auth-provider';
import DesignList from '@/components/design/design-list';
import { DesignFormSection, DesignHeader } from './components';
import { useDesignManagement } from './hooks';

const Design = () => {
  const { user } = useAuth();
  const {
    showForm,
    designToEdit,
    isEditing,
    handleDesignSuccess,
    handleEditDesign,
    handleCancelForm,
    handleAddNewDesign,
  } = useDesignManagement();

  return (
    <div>
      <DesignHeader
        showForm={showForm}
        isEditing={isEditing}
        onAddNewDesign={handleAddNewDesign}
        onCancelForm={handleCancelForm}
      />

      <DesignFormSection
        showForm={showForm}
        isEditing={isEditing}
        designToEdit={designToEdit}
        onSuccess={handleDesignSuccess}
      />

      <div className="mt-6">
        <h2 className="text-2xl font-semibold mb-4">Your Design Collection</h2>
        <p className="text-gray-400 mb-6">
          These designs are visible to customers on the platform.
        </p>

        {user && (
          <DesignList
            tailorId={user.id}
            showActions={true}
            onEditDesign={handleEditDesign}
          />
        )}
      </div>
    </div>
  );
};

export default Design;
