import { useState } from 'react'
import Cropper, { type Area } from 'react-easy-crop'

import styles from './ImageCropper.module.css'
import type { ImageCropperProps } from './ImageCropper.types'

import { getCroppedImg } from '@/utils/cropImage'

const ImageCropper = ({ image, onCropComplete, onClose }: ImageCropperProps) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

    const handleCrop = async () => {
        const blob = await getCroppedImg(image, croppedAreaPixels!)
        const file = new File([blob], 'Profiler.jpg', {
            type: 'image/jpeg',
        })
        onCropComplete(file)
    }

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.cropContainer}>
                    <Cropper
                        image={image}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
                    />
                </div>

                <div className={styles.controls}>
                    <input
                        type="range"
                        min={1}
                        max={3}
                        step={0.1}
                        value={zoom}
                        onChange={(e) => setZoom(Number(e.target.value))}
                    />

                    <div className={styles.buttons}>
                        <button onClick={onClose} className={styles.cancel}>
                            Cancel
                        </button>

                        <button onClick={handleCrop} className={styles.crop}>
                            Crop Image
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default ImageCropper
