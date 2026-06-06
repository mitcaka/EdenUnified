import { prisma } from '@/lib/prisma'
import ImageUpload from '@/components/ui/ImageUpload'
import SettingsForm from './SettingsForm'

export default async function SettingsPage() {
  const settings = await prisma.siteSetting.findMany({ orderBy: { key: 'asc' } })

  const labels: Record<string, string> = {
    server_name: 'Tên máy chủ', tagline: 'Tagline', description: 'Mô tả',
    server_ip: 'IP máy chủ', discord_url: 'Link Discord', contact_email: 'Email liên hệ',
    hero_banner: 'Ảnh bìa trang chủ (Banner)', battlemetrics_id: 'ID BattleMetrics',
    battlemetrics_token: 'Token API BattleMetrics'
  }

  // Ensure hero_banner and battlemetrics_id exist in settings array for the loop
  if (!settings.find(s => s.key === 'hero_banner')) {
    settings.push({ id: 'temp-hero', key: 'hero_banner', value: '', type: 'string' })
  }
  if (!settings.find(s => s.key === 'battlemetrics_id')) {
    settings.push({ id: 'temp-bm', key: 'battlemetrics_id', value: '38842637', type: 'string' })
  }
  if (!settings.find(s => s.key === 'battlemetrics_token')) {
    settings.push({ id: 'temp-bm-token', key: 'battlemetrics_token', value: '', type: 'string' })
  }

  // Sort settings to put hero_banner first
  settings.sort((a, b) => {
    if (a.key === 'hero_banner') return -1
    if (b.key === 'hero_banner') return 1
    return a.key.localeCompare(b.key)
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cài đặt trang</h1>
        <p className="text-sm text-gray-500 mt-1">Thông tin hiển thị trên trang người chơi (Hero section, Footer, Contact)</p>
      </div>
      <div className="space-y-4">
        {settings.map(s => (
          <SettingsForm key={s.id} className={`flex gap-4 items-start rounded-xl border border-gray-200 bg-white p-5 shadow-sm ${s.key === 'hero_banner' ? 'flex-col lg:flex-row' : ''}`}>
            <input type="hidden" name="key" value={s.key} />
            <div className="w-48 shrink-0">
              <label className="text-sm font-bold text-gray-800">{labels[s.key] || s.key}</label>
              <p className="text-xs text-gray-400 font-mono mt-0.5">{s.key}</p>
            </div>
            
            <div className="flex-1 w-full min-w-0">
              {s.key === 'description' ? (
                <textarea name="value" defaultValue={s.value} rows={3} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              ) : s.key === 'hero_banner' ? (
                <div className="max-w-xl">
                  <ImageUpload name="value" defaultValue={s.value} folder="CMS_Banners" />
                </div>
              ) : (
                <input type="text" name="value" defaultValue={s.value} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              )}
            </div>
            
            <button type="submit" className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 shrink-0 self-start transition-colors">Lưu</button>
          </SettingsForm>
        ))}
      </div>
    </div>
  )
}
