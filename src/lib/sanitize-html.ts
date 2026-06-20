/**
 * Sanitize HTML content từ Quill editor trước khi render.
 * Quill thường chuyển dấu cách thường → &nbsp; (non-breaking space, U+00A0).
 * Điều này khiến browser không có điểm ngắt dòng và buộc phải ngắt giữa ký tự.
 * Hàm này thay &nbsp; → khoảng trắng thường để giải quyết vấn đề trên.
 */
export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return ''
  return html
    .replace(/&nbsp;/g, ' ')           // entity &nbsp; → space
    .replace(/\u00a0/g, ' ')           // unicode non-breaking space → space
}
