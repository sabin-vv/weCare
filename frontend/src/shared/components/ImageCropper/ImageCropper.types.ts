export interface ImageCropperProps {
    image: string
    onCropComplete: (file: File) => void
    onClose: () => void
}
