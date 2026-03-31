export const getFileUrl = (path: string | undefined) => {
    if (!path) return ''
    if (path.startsWith('http')) return path
    
    const baseUrl = 'https://wecareuploads.s3.ap-south-1.amazonaws.com/'
    return `${baseUrl.endsWith('/') ? baseUrl : baseUrl + '/'}${path.startsWith('/') ? path.slice(1) : path}`
}
