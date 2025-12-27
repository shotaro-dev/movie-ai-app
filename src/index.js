import { openai, supabase } from "./config.js";

const form = document.getElementById("movie-form");
const resultEl = document.getElementById("recommended-movie-result");
const recommendedMovieSection = document.getElementById(
  "recommended-movie-section"
);
const goAgainButton = document.getElementById("go-again-button");
const movieFormSection = document.getElementById("movie-form-section");

const QUESTIONS = [
  "What is your favorite movie and why?",
  "Are you in the mood for something new or a classic?",
  "Do you wanna have fun or do you want somthing serious?",
];

// taxtareaからのinputsを受け取り、joinする

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  resultEl.innerHTML = "Loading...";
  //   textareaからの入力を取得
  const formData = new FormData(form);
  // formdataからの値を取得
  const inputs = formData.getAll("answer");
  // const query = QUESTIONS.map((question, index) => {
  //   return `${question}\n${inputs[index]}`;
  // }).join("\n\n");
  // console.log("User query:", query);
  
  const query = Array.from(inputs).join("\n");
  console.log("User query:", query);
  const movieDescription = await rewriteUserInputAsMovieDescription(query);
  console.log("Converted movie description:", movieDescription);
 
  const embedding = await createEmbedding(movieDescription);
  // console.log(embedding);
  const similarMovies = await searchSimilarMovies(embedding);
  console.log(similarMovies);
});

// console.log("test");

async function createEmbedding(text) {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });
    const embedding = response.data[0].embedding;
    return embedding;
  } catch (error) {
    console.error("Embedding API error:", error);
    throw error;
  }
}

// userからの解答を映画のvectordatabaseで類似検索しやすい形でchat completionで英訳する
async function rewriteUserInputAsMovieDescription(text) {
  const messages = [
    {
      role: "system",
      content:
        `You are an expert movie recommender and the world's foremost expert in translating all languages into English. 
        Convert user input into a concise movie description format, highlighting key themes, genres, and emotions that align with popular movie categories.`
    } ,
    {
      role: "user",
      content: `Convert the following user input into a movie description format in English:\n\n${text}`,
    }
  ]

  try { 
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
      temperature: 0.3,
      max_tokens: 300,
      presence_penalty: 0,// default 0
      frequency_penalty: 0, //default 0
    });

    if (!response.choices || response.choices.length === 0) {
      throw new Error("No choices returned from conversion API");
    }

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("Conversion API error:", error);
    throw error;
  }
}


// ベクトルの類似性で映画を検索する
async function searchSimilarMovies(embedding) {
  try {
    const { data, error } = await supabase.rpc("search_similar_movies", {
      query_embedding: embedding,
      similarity_match_threshold: 0.2,
      match_count: 1,
    });
    if (error) {
      throw error;
    }
    console.log("Supabase search data:", data);
    return data;
  } catch (error) {
    console.error("Supabase search error:", error);
    throw error;
  }
}

// content.jsをベクトル化して、supabaseに保存するコードを作成する
async function storeMovieEmbeddings() {
  const movies = await import("./content.js");
  try {
    const data = await Promise.all(
      movies.default.map(async (movie) => {
        const { title, releaseYear, content } = movie;
        // オブジェクトはembeddingできないから文字列に変換する。
        const embeddingText = `${title}\n(${releaseYear})\n${content}`;
        const embedding = await createEmbedding(embeddingText);
        return {
          title,
          release_year: releaseYear,
          content,
          embedding,
        };
      })
    );
    if (data.length === 0) {
      throw new Error("No movie data to store.");
    }

    const { error } = await supabase.from("movies").insert(data);
    if (error) {
      throw new Error("Supabase insert error: " + error.message);
    }

    console.log(
      "All movie embeddings stored. " + data.length + " records added."
    );
  } catch (error) {
    console.error("Error storing movie embeddings: ", error);
  }
}
// storeMovieEmbeddings();
