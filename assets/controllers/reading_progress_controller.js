import { Controller } from '@hotwired/stimulus';

/*
 * Tracks how far the user has scrolled through an article, paints a thin
 * progress bar, and persists the furthest point reached to the server.
 *
 * Progress is monotonic (it only ever moves forward) and is flushed on a
 * timer as well as when the reader is left, to avoid hammering the endpoint
 * on every scroll event.
 */
export default class extends Controller {
  static targets = ['bar'];

  static values = {
    url: String,
    token: String,
    initial: Number,
    interval: { type: Number, default: 5000 },
  };

  initialize() {
    this.furthest = this.hasInitialValue ? this.initialValue : 0;
    this.lastSent = this.furthest;
  }

  connect() {
    this.paint();
    this.timer = window.setInterval(() => this.flush(), this.intervalValue);
  }

  disconnect() {
    if (this.timer) {
      window.clearInterval(this.timer);
    }
    this.flush();
  }

  update() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const percent = scrollable > 0
      ? Math.round((window.scrollY / scrollable) * 100)
      : 100;

    const clamped = Math.max(0, Math.min(100, percent));

    if (clamped > this.furthest) {
      this.furthest = clamped;
      this.paint();
    }
  }

  paint() {
    if (this.hasBarTarget) {
      this.barTarget.style.width = `${this.furthest}%`;
    }
  }

  flush() {
    if (!this.hasUrlValue || this.furthest <= this.lastSent) {
      return;
    }

    const body = new URLSearchParams();
    body.set('token', this.tokenValue);
    body.set('progress', String(this.furthest));

    const sent = this.furthest;

    fetch(this.urlValue, {
      method: 'POST',
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
      body,
      credentials: 'same-origin',
    })
      .then(() => {
        this.lastSent = sent;
      })
      .catch(() => {
        // Network hiccup — keep the value pending so the next flush retries.
      });
  }
}
