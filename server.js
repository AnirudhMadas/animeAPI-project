import express from 'express';
import axios from 'axios';

const app = express();
const PORT = 3000;

app.set('view engine','ejs');

// Example route to fetch data from an external API using axios
app.get('/', async (req, res) => {
    try {
        const response = await axios.get('https://api.animechan.io/v1/quotes/random');
        const result = response.data;
        res.render("index", { result: result });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch anime data' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});