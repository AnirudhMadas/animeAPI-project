import express from 'express';
import axios from 'axios';
import bodyParser from 'body-parser';

const app = express();
const PORT = process.env.PORT || 3000;

// Set view engine
app.set('view engine', 'ejs');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // For serving static files (CSS, JS, images)

// GraphQL query constant
const ANIME_SEARCH_QUERY = `
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
      status
      genres
      averageScore
      coverImage {
        large
        medium
      }
      bannerImage
      startDate {
        year
        month
        day
      }
    }
  }
`;

// Routes
app.get("/", (req, res) => {
  res.render("index", { anime: null, error: null });
});

app.post("/search", async (req, res) => {
  const userInput = req.body.query?.trim();
  
  // Input validation
  if (!userInput) {
    return res.render("index", { 
      anime: null, 
      error: "Please enter an anime name to search" 
    });
  }

  console.log(`Searching for: ${userInput}`);

  const variables = {
    search: userInput
  };

  try {
    const response = await axios.post(
      "https://graphql.anilist.co",
      {
        query: ANIME_SEARCH_QUERY,
        variables,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        timeout: 10000 // 10 second timeout
      }
    );

    const anime = response.data.data.Media;
    
    if (!anime) {
      return res.render("index", { 
        anime: null, 
        error: `No anime found for "${userInput}"` 
      });
    }

    console.log("AniList Response:", anime.title.romaji || anime.title.english);
    
    // Consistent variable naming
    res.render("index", { anime, error: null });
    
  } catch (error) {
    console.error("AniList API Error:", error.message);
    
    let errorMessage = "Error fetching anime data";
    if (error.code === 'ECONNABORTED') {
      errorMessage = "Request timed out. Please try again.";
    } else if (error.response?.status === 429) {
      errorMessage = "Too many requests. Please wait a moment and try again.";
    }
    
    res.render("index", { 
      anime: null, 
      error: errorMessage 
    });
  }
});

// Handle 404s
app.use((req, res) => {
  res.status(404).render("index", { 
    anime: null, 
    error: "Page not found" 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("index", { 
    anime: null, 
    error: "Something went wrong on our end" 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});