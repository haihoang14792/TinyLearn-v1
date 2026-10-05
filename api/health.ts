export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json({
    status: 'ok',
    nativeTTSAvailable: true,
    platform: 'vercel',
    timestamp: Date.now(),
  });
}
