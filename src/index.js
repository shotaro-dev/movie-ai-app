import { openai, supabase } from "./config.js";

const form = document.getElementById("movie-form");
const resultEl = document.getElementById("recommended-movie-result");
const recommendedMovieSection = document.getElementById(
  "recommended-movie-section"
);
const goAgainButton = document.getElementById("go-again-button");
const movieFormSection = document.getElementById("movie-form-section");

// taxtareaからのinputsを受け取り、joinする

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  resultEl.innerHTML = "Loading...";
  //   textareaからの入力を取得
  const formData = new FormData(form);
  // formdataからの値を取得
  const inputs = formData.getAll("question");
  const query = inputs.join("\n");

  const embedding = await createEmbedding(query);
  console.log(embedding);
});

// console.log("test");

async function createEmbedding(input) {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: input,
    });
    const embedding = response.data[0].embedding;
    return embedding;
  } catch (error) {
    console.error("Embedding API error:", error);
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
