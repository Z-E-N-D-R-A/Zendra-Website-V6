export const config = { runtime: 'edge' }; // Fastest performance in 2026

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const endpoint = searchParams.get('endpoint'); // e.g., 'search' or 'videos'
  
  // 1. Get your hidden key from Vercel's private environment
  const YAK = process.env.YOUTUBE_API_KEY;
  
  // 2. Reconstruct the YouTube URL using the rest of the parameters
  const ytParams = new URLSearchParams(searchParams);
  ytParams.delete('endpoint'); // Don't send our internal 'endpoint' param to Google
  ytParams.set('key', YAK);    // Safely attach the hidden key here

  const ytUrl = `https://www.googleapis.com{endpoint}?${ytParams.toString()}`;

  try {
    const res = await fetch(ytUrl);
    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to fetch YouTube data" }), { status: 500 });
  }
}