import { openai, supabase } from "./config.js";

const form = document.getElementById("movie-form");
const resultEl = document.getElementById("recommended-movie-result");

// taxtareaからのinputsを受け取り、joinする

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  resultEl.innerHTML = "Loading...";
  //   textareaからの入力を取得
  const formData = new FormData(form);
  // formdataからの値を取得
  const inputs = formData.getAll("question");
  const query = inputs.join("\n");

  const embedding = await embeddingQuery(query);
  console.log(embedding);
});

// console.log("test");

async function embeddingQuery(query) {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: query,
  });
  const embedding = response.data[0].embedding;
  return embedding;
  // console.log(response.data[0].embedding);
}



