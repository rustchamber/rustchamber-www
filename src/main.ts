import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'
import { initReveal } from './lib/reveal'
import { initTheme } from './lib/theme'
import { pageFromBody } from './lib/site'

initTheme()

const app = mount(App, {
  target: document.getElementById('app')!,
  props: { page: pageFromBody() },
})

initReveal()

export default app
