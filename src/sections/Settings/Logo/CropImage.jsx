import React, { useState, useRef } from 'react';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import get from 'lodash/get';
import isUndefined from 'lodash/isUndefined';

import 'react-image-crop/dist/ReactCrop.css';

function CropImage({ open, onClose, imageURL, imageData, setValue, postLogoImage }) {
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState();
  const imgRef = useRef(null);

  const aspect = null;

  const isImageNotCropped =
    (get(crop, 'width') === 0 && get(crop, 'height') === 0) || isUndefined(crop);

  function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
    return centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        aspect,
        mediaWidth,
        mediaHeight
      ),
      mediaWidth,
      mediaHeight
    );
  }

  function getCroppedImg(image, crop) {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = Math.ceil(crop.width * scaleX);
    canvas.height = Math.ceil(crop.height * scaleY);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error('Canvas is empty');
          return;
        }
        resolve(blob);
      }, get(imageData, 'type'));
    });
  }

  async function getCroppedImage(crop) {
    if (imgRef && crop.width && crop.height) {
      const croppedImage = await getCroppedImg(imgRef.current, crop);
      setCompletedCrop(croppedImage);
    }
  }

  function onImageLoad(e) {
    if (aspect) {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspect));
    }
  }

  async function handleSave() {
    const blobURL = URL.createObjectURL(completedCrop);
    const blob = await fetch(blobURL).then((res) => res.blob());

    const file = new File([blob], get(imageData, 'name'), { type: blob.type });

    setValue('avatarUrl', Object.assign(file, { preview: blobURL }));
    onClose();
    postLogoImage(file);
    URL.revokeObjectURL(blobURL);
  }

  document.querySelector('.ReactCrop__crop-mask')?.setAttribute('height', '100%');

  return (
    <Dialog open={open} fullWidth maxWidth="xs">
      <Box sx={{ p: 2 }}>
        <Typography gutterBottom variant="h6">
          Crop image
        </Typography>
        <ReactCrop
          crop={crop}
          onChange={(_, percentCrop) => setCrop(percentCrop)}
          onComplete={(crop) => getCroppedImage(crop)}
          aspect={aspect}
          minHeight={100}
        >
          <img ref={imgRef} alt="Crop me" src={imageURL} onLoad={onImageLoad} />
        </ReactCrop>
        <Stack direction="row" gap={2} mt={2} justifyContent="flex-end">
          <Button color="error" size="small" variant="contained" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="small"
            variant="contained"
            disabled={isImageNotCropped}
            onClick={handleSave}
          >
            Save
          </Button>
        </Stack>
      </Box>
    </Dialog>
  );
}

export default CropImage;
