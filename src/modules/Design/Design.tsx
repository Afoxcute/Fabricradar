'use client';

import React, { useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import DesignList from '@/components/design/design-list';
import { DesignFormSection, DesignHeader } from './components';
import { useDesignManagement } from './hooks';
import { CustomModal } from '@/components/Modal';
import { Design as DesignTy } from './types/design';

const Design = () => {
  const { user } = useAuth();
  const { showForm, isEditing, handleDesignSuccess } = useDesignManagement();

  const [modal, setModal] = useState<{
    type: 'create' | 'edit';
    show: boolean;
    data?: DesignTy | null;
  }>({
    type: 'create',
    show: false,
  });

  const closeModal = () => {
    setModal((prev) => ({
      ...prev,
      show: false,
    }));
  };

  const toggleModal = () => {
    setModal((prev) => ({
      ...prev,
      show: !prev.show,
    }));
  };

  const designSucess = () => {
    handleDesignSuccess();
    setTimeout(() => {
      closeModal();
    }, 2000);
  };

  const editModal = (design: DesignTy) => {
    console.log(design, 'Design');
    setModal((prev) => ({
      ...prev,
      show: true,
      type: 'edit',
      data: design,
    }));
  };

  return (
    <div className="relative">
      <DesignHeader
        showForm={showForm}
        isEditing={isEditing}
        onAddNewDesign={toggleModal}
        onCancelForm={closeModal}
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
            onEditDesign={editModal}
          />
        )}
      </div>
      <CustomModal
        show={modal.show}
        onDismiss={closeModal}
        modalClassName="bg-gray-900/60 backdrop-blur-sm"
        title={modal.type == 'create' ? 'Create Design' : 'Edit Design'}
      >
        <DesignFormSection
          isEditing={modal.type === 'edit' ? true : false}
          designToEdit={modal.data ?? null}
          onSuccess={designSucess}
        />
      </CustomModal>
    </div>
  );
};

export default Design;
