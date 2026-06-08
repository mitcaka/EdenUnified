'use client'

import { useState, useMemo, useCallback } from 'react'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'
import 'react-quill-new/dist/quill.snow.css'

// Dynamic import to prevent SSR hydration errors with React-Quill
const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
  loading: () => (
    <div className="h-64 flex flex-col items-center justify-center bg-gray-50 border border-gray-200 rounded-lg">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
      <p className="text-sm text-gray-500">Đang tải trình soạn thảo...</p>
    </div>
  )
})

interface RichTextEditorProps {
  name: string
  defaultValue?: string
  placeholder?: string
}

export default function RichTextEditor({ name, defaultValue = '', placeholder = 'Viết nội dung (có thể chèn link, ảnh...)' }: RichTextEditorProps) {
  const [content, setContent] = useState(defaultValue)
  // Store quill instance via onMount workaround (dynamic import doesn't support ref forwarding)
  const editorId = useMemo(() => `quill-editor-${Math.random().toString(36).slice(2)}`, [])

  const imageHandler = useCallback(() => {
    const input = document.createElement('input')
    input.setAttribute('type', 'file')
    input.setAttribute('accept', 'image/*')
    input.click()

    input.onchange = async () => {
      const file = input.files ? input.files[0] : null
      if (!file) return

      const toastId = toast.loading('Đang tải ảnh lên Cloud...')

      try {
        const url = `/api/upload?raw=true&folder=CMS_Media&name=${encodeURIComponent(file.name)}&type=${encodeURIComponent(file.type || '')}`
        
        const response = await fetch(url, {
          method: 'POST',
          body: file,
          headers: {
            'Content-Type': file.type || 'application/octet-stream',
          }
        })

        if (!response.ok) throw new Error('Upload thất bại')

        const data = await response.json()
        const imageUrl = data.url

        // Get quill instance through container
        const container = document.getElementById(editorId)
        const qlEditor = container?.querySelector('.ql-editor')
        if (qlEditor) {
          // Use execCommand as fallback for inserting image
          const sel = window.getSelection()
          if (sel && sel.rangeCount > 0) {
            const img = document.createElement('img')
            img.src = imageUrl
            sel.getRangeAt(0).insertNode(img)
          } else {
            qlEditor.innerHTML += `<img src="${imageUrl}" />`
          }
          // Trigger onChange by dispatching input event
          qlEditor.dispatchEvent(new Event('input', { bubbles: true }))
        }

        toast.success('Tải ảnh thành công', { id: toastId })
      } catch (error) {
        console.error(error)
        toast.error('Có lỗi khi tải ảnh', { id: toastId })
      }
    }
  }, [editorId])

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['link', 'image'],
        ['clean']
      ],
      handlers: {
        image: imageHandler
      }
    }
  }), [imageHandler])

  return (
    <div id={editorId} className="rich-text-editor-wrapper relative">
      <input type="hidden" name={name} value={content} />
      <ReactQuill
        theme="snow"
        value={content}
        onChange={setContent}
        modules={modules}
        placeholder={placeholder}
        className="bg-white rounded-md flex flex-col h-full min-h-[400px]"
      />

      <style jsx global>{`
        .rich-text-editor-wrapper {
          display: flex;
          flex-direction: column;
        }
        .rich-text-editor-wrapper .quill {
          display: flex;
          flex-direction: column;
          border-radius: 0.5rem;
          overflow: hidden;
          border: 1px solid #e5e7eb;
        }
        .rich-text-editor-wrapper .ql-toolbar.ql-snow {
          border: none;
          border-bottom: 1px solid #e5e7eb;
          background-color: #f9fafb;
          padding: 12px;
        }
        .rich-text-editor-wrapper .ql-container.ql-snow {
          border: none;
          flex: 1;
          min-height: 350px;
          font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif;
          font-size: 15px;
        }
        .rich-text-editor-wrapper .ql-editor {
          padding: 20px;
        }
        .rich-text-editor-wrapper .ql-editor h2 {
          font-weight: 700;
          margin-bottom: 1rem;
        }
        .rich-text-editor-wrapper .ql-editor img {
          border-radius: 0.5rem;
          margin: 1rem 0;
        }
      `}</style>
    </div>
  )
}
