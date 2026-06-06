'use client'

import { useState, useRef, useMemo } from 'react'
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
  const quillRef = useRef<any>(null)

  const imageHandler = () => {
    const input = document.createElement('input')
    input.setAttribute('type', 'file')
    input.setAttribute('accept', 'image/*')
    input.click()

    input.onchange = async () => {
      const file = input.files ? input.files[0] : null
      if (!file) return

      const toastId = toast.loading('Đang tải ảnh lên Cloud...')
      
      try {
        const formData = new FormData()
        formData.append('file', file)
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })
        
        if (!response.ok) throw new Error('Upload thất bại')
        
        const data = await response.json()
        const url = data.url
        
        // Insert image to editor
        const quill = quillRef.current?.getEditor()
        if (quill) {
          const range = quill.getSelection(true)
          // Nếu không focus, chèn vào cuối
          const index = range ? range.index : quill.getLength()
          quill.insertEmbed(index, 'image', url)
        }
        
        toast.success('Tải ảnh thành công', { id: toastId })
      } catch (error) {
        console.error(error)
        toast.error('Có lỗi khi tải ảnh', { id: toastId })
      }
    }
  }

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['link', 'image', 'video'],
        ['clean']
      ],
      handlers: {
        image: imageHandler
      }
    }
  }), [])

  return (
    <div className="rich-text-editor-wrapper relative">
      <input type="hidden" name={name} value={content} />
      <ReactQuill 
        ref={quillRef}
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
