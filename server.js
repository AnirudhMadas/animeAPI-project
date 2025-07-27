import express from 'express';
import axios from 'axios';

const app = express();
const PORT = 3000;

app.set('view engine','ejs');

// Example route to fetch data from an external API using axios
app.get("/", async (req, res) => {
  const query = `
    query ($search: String) {
  Media(search: $search, type: ANIME) {
    id
    title {
      romaji
      english
      native
    }
    description
    episodes
    coverImage {
      large
    }
  }
}`;

  const variables = {
    search: "Attack on Titan"
  };

  try {
    const response = await axios.post("https://graphql.anilist.co", {
      query,
      variables
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });

    res.render("index.ejs",{title:response.data}); // or render with EJS
  } catch (error) {
    res.status(500).send("Error fetching from AniList");
  }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});