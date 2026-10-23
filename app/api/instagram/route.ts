import { NextResponse } from 'next/server'

export const revalidate = 3600

export interface InstagramPost {
  id: string
  caption?: string
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
  media_url: string
  thumbnail_url?: string
  permalink: string
  timestamp: string
}

export async function GET() {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN
  if (!token) return NextResponse.json({ posts: [], configured: false })

  try {
    const res = await fetch(
      `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&limit=3&access_token=${token}`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ posts: [], configured: false, error: err })
    }
    const data = await res.json()
    const posts: InstagramPost[] = (data.data ?? []).map((p: InstagramPost) => ({
      ...p,
      media_url: p.media_type === 'VIDEO' ? (p.thumbnail_url ?? p.media_url) : p.media_url,
    }))
    return NextResponse.json({ posts, configured: true })
  } catch (e) {
    return NextResponse.json({ posts: [], configured: false, error: String(e) })
  }
}
