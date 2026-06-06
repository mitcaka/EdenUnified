import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding CMS data...')

  // 1. SiteSettings
  const settings = [
    { key: 'server_name', value: 'Eden PZ', type: 'string' },
    { key: 'tagline', value: 'A serious Project Zomboid roleplay experience.', type: 'string' },
    { key: 'description', value: 'Survive, build, and write your story in a persistent post-apocalyptic Kentucky. Eden PZ is a community-driven roleplay server focused on immersion and consequence.', type: 'string' },
    { key: 'server_ip', value: 'play.edenpz.info:16261', type: 'string' },
    { key: 'discord_url', value: 'https://discord.gg/edenpz', type: 'string' },
    { key: 'contact_email', value: 'staff@edenpz.info', type: 'string' },
  ]
  for (const s of settings) {
    await prisma.siteSetting.upsert({ where: { key: s.key }, update: s, create: s })
  }
  console.log(`  ✅ ${settings.length} SiteSettings`)

  // 2. Pages
  const pages = [
    {
      title: 'Roleplay Guide', slug: 'rp-guide', status: 'published',
      seoTitle: 'Roleplay Guide — Eden PZ',
      seoDescription: 'Learn the foundations of roleplay on Eden PZ.',
      publishedAt: new Date('2025-01-12T10:00:00Z'),
      content: `<h2>What roleplay means here</h2>
<p>Eden PZ is a <strong>character-first</strong> server. You are not playing yourself with a different skin — you are inhabiting a person who lives inside the outbreak. Their fears, skills, history, and limits are not yours.</p>
<h2>The core pillars</h2>
<ul>
  <li><strong>Fear Roleplay (FearRP)</strong> — when your life is credibly threatened, your character behaves like a person who wants to live.</li>
  <li><strong>Permadeath has weight</strong> — death is the end of that story. Honor it.</li>
  <li><strong>No metagaming</strong> — out-of-character knowledge does not exist to your character.</li>
  <li><strong>No powergaming</strong> — your character is not invincible, and you do not force outcomes on others.</li>
</ul>
<h2>Building a character</h2>
<p>Before you join, write a short backstory: who they were before, what they lost, what they want now. A name, an age, a job, a flaw. That is enough to start.</p>
<h2>In-character vs out-of-character</h2>
<p>All public chat is IC by default. Use <code>/ooc</code> sparingly. Discord is OOC unless marked otherwise.</p>`,
    },
    {
      title: 'How to Join', slug: 'how-to-join', status: 'published',
      seoTitle: 'How to Join — Eden PZ',
      seoDescription: 'Step-by-step guide to joining the Eden PZ roleplay server.',
      publishedAt: new Date('2025-01-10T10:00:00Z'),
      content: `<h2>1. Read the rules</h2>
<p>Start with the <a href="/rules">server rules</a> and the <a href="/rp-guide">roleplay guide</a>. Whitelisting depends on showing you understand them.</p>
<h2>2. Join our Discord</h2>
<p>All applications, support, and community chat happen on Discord. Use the invite on the <a href="/contact">contact page</a>.</p>
<h2>3. Submit a whitelist application</h2>
<p>Open the <code>#applications</code> channel and follow the template. Tell us about your character — not yourself.</p>
<h2>4. Install required mods</h2>
<p>The current modlist is pinned in <code>#announcements</code>. Subscribe to the Steam Workshop collection, launch Project Zomboid once to let it download, then restart.</p>
<h2>5. Connect</h2>
<p>Once whitelisted, add the server: <code>play.edenpz.info</code> port <code>16261</code>. See you in Kentucky.</p>`,
    },
  ]
  for (const p of pages) {
    await prisma.page.upsert({ where: { slug: p.slug }, update: p, create: p })
  }
  console.log(`  ✅ ${pages.length} Pages`)

  // 3. RuleCategories + Rules
  const ruleCategories = [
    { id: 1, name: 'Core Conduct', slug: 'core-conduct', description: 'Universal rules that apply at all times.', sortOrder: 1 },
    { id: 2, name: 'Roleplay Standards', slug: 'roleplay-standards', description: 'How characters and stories are expected to behave.', sortOrder: 2 },
    { id: 3, name: 'Combat & PvP', slug: 'combat-pvp', description: 'When violence is allowed and how it must be handled.', sortOrder: 3 },
    { id: 4, name: 'Building & Bases', slug: 'building-bases', description: 'Construction limits and raiding etiquette.', sortOrder: 4 },
  ]
  for (const c of ruleCategories) {
    await prisma.ruleCategory.upsert({ where: { id: c.id }, update: c, create: c })
  }

  const rules = [
    { title: 'No harassment', slug: 'no-harassment', content: 'Treat every player with respect out-of-character. Slurs, hate speech, and targeted harassment will result in immediate removal.', categoryId: 1, severity: 'critical', sortOrder: 1 },
    { title: 'No cheating or exploits', slug: 'no-cheating', content: 'Mods outside the official list, third-party tools, and bug exploitation are forbidden.', categoryId: 1, severity: 'critical', sortOrder: 2 },
    { title: 'Stay in character', slug: 'stay-in-character', content: 'Public chat is IC. Use /ooc only for clarifications or emergencies.', categoryId: 2, severity: 'major', sortOrder: 1 },
    { title: 'No metagaming', slug: 'no-metagaming', content: 'Information learned out-of-character (Discord, streams, deaths) cannot influence your character\'s actions.', categoryId: 2, severity: 'major', sortOrder: 2 },
    { title: 'No powergaming', slug: 'no-powergaming', content: 'You cannot force actions or outcomes on another player\'s character. Give them agency to respond.', categoryId: 2, severity: 'major', sortOrder: 3 },
    { title: 'Initiate before conflict', slug: 'initiate-before-conflict', content: 'Hostile actions require a clear roleplay initiation. No random deathmatching.', categoryId: 3, severity: 'major', sortOrder: 1 },
    { title: 'New Life Rule', slug: 'new-life-rule', content: 'When a character dies, the next character has no memory of the previous one.', categoryId: 3, severity: 'critical', sortOrder: 2 },
    { title: 'Base build limits', slug: 'base-build-limits', content: 'Bases must remain breachable. No skybases, no unraidable fortresses.', categoryId: 4, severity: 'minor', sortOrder: 1 },
    { title: 'Raid windows', slug: 'raid-windows', content: 'Raids are permitted only during posted server windows. See Discord for current times.', categoryId: 4, severity: 'minor', sortOrder: 2 },
  ]
  for (const r of rules) {
    await prisma.rule.upsert({ where: { slug: r.slug }, update: r, create: r })
  }
  console.log(`  ✅ ${ruleCategories.length} RuleCategories + ${rules.length} Rules`)

  // 4. GuideCategories + Guides
  const guideCategories = [
    { id: 1, name: 'Getting Started', slug: 'getting-started', sortOrder: 1 },
    { id: 2, name: 'Survival', slug: 'survival', sortOrder: 2 },
    { id: 3, name: 'Roleplay', slug: 'roleplay', sortOrder: 3 },
  ]
  for (const c of guideCategories) {
    await prisma.guideCategory.upsert({ where: { id: c.id }, update: c, create: c })
  }

  const guides = [
    { title: 'Your first 24 hours', slug: 'first-24-hours', excerpt: 'Where to spawn, what to grab, and how to not die before sunset.', content: '<p>Your first day defines your run. Loot quietly, find shelter before dusk, and avoid any group of more than two zombies until you\'ve found a melee weapon you trust.</p><h3>Priority loot</h3><ul><li>Bag (any)</li><li>Canned food + opener</li><li>Sturdy melee</li><li>Sheets for windows</li></ul>', categoryId: 1, difficulty: 'beginner', sortOrder: 1 },
    { title: 'Reading the infection', slug: 'reading-the-infection', excerpt: 'Scratch, laceration, or bite — what actually kills you.', content: '<p>Not every wound from a zombie is fatal. Scratches carry roughly a 7% infection chance, lacerations 25%, bites are effectively certain death. Bandage clean, check moodles, and roleplay the fear honestly.</p>', categoryId: 2, difficulty: 'intermediate', sortOrder: 1 },
    { title: 'Writing a believable character', slug: 'writing-a-believable-character', excerpt: 'Flaws make a character real. A backstory makes them yours.', content: '<p>The strongest characters on Eden PZ are not the toughest survivors — they are the ones with something to lose. Give your character a fear, a habit, a person they\'re trying to find.</p>', categoryId: 3, difficulty: 'beginner', sortOrder: 1 },
    { title: 'Generators and long-term power', slug: 'generators-and-power', excerpt: 'Fuel, noise, and keeping the lights on without inviting the dead.', content: '<p>Generators are loud. Place them on rooftops or in soundproofed sheds, and never run them overnight near unsecured walls.</p>', categoryId: 2, difficulty: 'advanced', sortOrder: 2 },
  ]
  for (const g of guides) {
    await prisma.guide.upsert({ where: { slug: g.slug }, update: g, create: g })
  }
  console.log(`  ✅ ${guideCategories.length} GuideCategories + ${guides.length} Guides`)

  // 5. MediaItems
  const mediaItems = [
    { id: 1, title: 'Dusk over Muldraugh', type: 'image', mediaUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600', thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600', tags: '["landscape","season-3"]', isFeatured: true, sortOrder: 1, seasonId: 3 },
    { id: 2, title: 'Abandoned highway', type: 'image', mediaUrl: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=1600', thumbnailUrl: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=600', tags: '["landscape"]', isFeatured: false, sortOrder: 2, seasonId: 3 },
    { id: 3, title: 'The safehouse', type: 'image', mediaUrl: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=1600', thumbnailUrl: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=600', tags: '["base","season-2"]', isFeatured: true, sortOrder: 3, seasonId: 2 },
    { id: 4, title: 'Quiet woods', type: 'image', mediaUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1600', thumbnailUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600', tags: '["landscape"]', isFeatured: false, sortOrder: 4, seasonId: 3 },
    { id: 5, title: 'Storm front', type: 'image', mediaUrl: 'https://images.unsplash.com/photo-1429552077091-836152271555?w=1600', thumbnailUrl: 'https://images.unsplash.com/photo-1429552077091-836152271555?w=600', tags: '["weather"]', isFeatured: false, sortOrder: 5, seasonId: 3 },
    { id: 6, title: 'Empty town square', type: 'image', mediaUrl: 'https://images.unsplash.com/photo-1519183071298-a2962be96693?w=1600', thumbnailUrl: 'https://images.unsplash.com/photo-1519183071298-a2962be96693?w=600', tags: '["urban"]', isFeatured: false, sortOrder: 6, seasonId: 2 },
  ]
  for (const m of mediaItems) {
    await prisma.mediaItem.upsert({ where: { id: m.id }, update: m, create: m })
  }
  console.log(`  ✅ ${mediaItems.length} MediaItems`)

  // 6. NewsPosts
  const newsPosts = [
    { title: 'Season 3 begins this Saturday', slug: 'season-3-begins', excerpt: 'A fresh map, a new modlist, and a wiped world. Here\'s what to expect.', content: '<p>After six months of Season 2, we are wiping. Season 3 launches Saturday at 19:00 UTC with a new modlist, refined raid windows, and a return to West Point as the central hub.</p>', coverImageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600', status: 'published', publishedAt: new Date('2025-05-20T18:00:00Z') },
    { title: 'Updated rules: combat initiation', slug: 'updated-rules-combat-initiation', excerpt: 'We\'ve tightened how hostile interactions must begin.', content: '<p>Effective immediately, all hostile actions require a verbal or text initiation with a clear demand and a reasonable response window. See the <a href=\'/rules\'>rules page</a> for the full text.</p>', status: 'published', publishedAt: new Date('2025-04-11T12:00:00Z') },
    { title: 'Community spotlight: The Drifters', slug: 'community-spotlight-drifters', excerpt: 'A traveling caravan that has reshaped trade across three towns.', content: '<p>The Drifters started as three players sharing a van. Two months later, they run the most active trade network on the server.</p>', coverImageUrl: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=1600', status: 'published', publishedAt: new Date('2025-03-02T09:00:00Z') },
  ]
  for (const n of newsPosts) {
    await prisma.newsPost.upsert({ where: { slug: n.slug }, update: n, create: n })
  }
  console.log(`  ✅ ${newsPosts.length} NewsPosts`)

  // 7. FAQs
  const faqs = [
    { id: 1, question: 'Is the server whitelist-only?', answer: 'Yes. Every player goes through an application process on our Discord.', category: 'Joining', sortOrder: 1 },
    { id: 2, question: 'Do I need to own DLC?', answer: 'Project Zomboid has no DLC. You only need the base game on Steam.', category: 'Joining', sortOrder: 2 },
    { id: 3, question: 'What mods are required?', answer: 'The current modlist is pinned in #announcements on Discord and updates each season.', category: 'Joining', sortOrder: 3 },
    { id: 4, question: 'How long does whitelisting take?', answer: 'Typically 24–72 hours. Staff review each application individually.', category: 'Joining', sortOrder: 4 },
    { id: 5, question: 'Can I play solo?', answer: 'Yes. Solo characters are fully supported — roleplay does not require a group.', category: 'Gameplay', sortOrder: 1 },
    { id: 6, question: 'What happens when my character dies?', answer: 'Permadeath is enforced. You may make a new character, but they share no memory with the previous one.', category: 'Gameplay', sortOrder: 2 },
    { id: 7, question: 'Is there a server wipe schedule?', answer: 'Seasons run roughly 4–6 months. Wipes are announced at least two weeks in advance.', category: 'Gameplay', sortOrder: 3 },
  ]
  for (const f of faqs) {
    await prisma.faq.upsert({ where: { id: f.id }, update: f, create: f })
  }
  console.log(`  ✅ ${faqs.length} FAQs`)

  console.log('✨ CMS seed complete!')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
