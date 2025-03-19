import { RHFUploadSingleFile } from './RHFUpload';
import { useCallback } from 'react';

const UploadImage = ({ setValue, values, isEdit, name = 'images' }) => {
  const handleDrop = useCallback(
    (acceptedFiles) => {
      const imageFile = acceptedFiles[0]; // Get the first image file
      if (imageFile) {
        const updatedImage = Object.assign(imageFile, {
          preview: URL.createObjectURL(imageFile),
        });
        setValue(name, updatedImage);
      }
    },
    [values]
  );
  return (
    <>
      <RHFUploadSingleFile
        showPreview
        name={name}
        maxSize={3145728}
        onDrop={handleDrop}
        onUpload={() => console.log('ON UPLOAD')}
        type="image"
        accept={{
          'image/*': [],
        }}
      />
    </>
  );
};

export default UploadImage;
