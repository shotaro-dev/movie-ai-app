import OpenAI from "openai/index.mjs";
import { createClient } from "@supabase/supabase-js";
// import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

/** OpenAI config */
if (!import.meta.env.VITE_OPENAI_API_KEY)
  throw new Error("OpenAI API key is missing or invalid.");
export const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

/** Supabase config */
const privateKey = import.meta.env.VITE_SUPABASE_API_KEY;
if (!privateKey) throw new Error(`Expected env var VITE_SUPABASE_API_KEY`);
const url = import.meta.env.VITE_SUPABASE_URL;
if (!url) throw new Error(`Expected env var VITE_SUPABASE_URL`);
export const supabase = createClient(url, privateKey);

// #challenge movies.textをchnkkに分割し、ベクトル化して、supabaseに保存する。
// "@langchain/textsplitters"がvite側で動作しないため、node側で実行する必要がある。
