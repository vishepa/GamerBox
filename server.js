import 'dotenv/config';
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server is up');
});

app.get('/api/catalogue', async (req, res) => {

  const params = new URLSearchParams({
    key: process.env.STEAM_API_KEY,
    input_json: JSON.stringify({
        include_games: true,
        include_dlc: false,
        include_software: false,
        include_videos: false,
        include_hardware: false,
        max_results: 100,
    }),
  });

  try {
    const steamResponse = await fetch(`https://api.steampowered.com/IStoreService/GetAppList/v1/?${params}`);
    if (!steamResponse.ok) return res.status(502).json({ error: `Steam returned ${steamResponse.status}` });
    const { response } = await steamResponse.json();
    res.json(response);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
  
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});