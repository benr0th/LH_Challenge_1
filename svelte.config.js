import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import dotenv from 'dotenv'

export default {
  // Consult https://svelte.dev/docs#compile-time-svelte-preprocess
  // for more information about preprocessors
  preprocess: vitePreprocess(),
  dotenv: dotenv.config(),
}
