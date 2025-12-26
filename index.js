import { openai, supabase } from "./config.js";

const form = document.getElementById("movie-form");
const resultEl = document.getElementById("recommended-movie-result");

// taxtareaからのinputsを受け取り、joinする

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  resultEl.innerHTML = "Loading...";
  //   textareaからの入力を取得

});

console.log("test");
