"use client";

import { Component, type ReactNode } from "react";

type Props = { appTitle: string; children: ReactNode };
type State = { error: Error | null };

/** One per window: a crashing app shows an error inside its own window, the desktop keeps running. */
export class WindowErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div role="alert" className="flex flex-col items-start gap-3 p-6 font-mono text-sm">
        <p>
          <span className="text-accent">ERR</span> {this.props.appTitle} gặp lỗi và đã dừng.
        </p>
        <button
          type="button"
          onClick={() => this.setState({ error: null })}
          className="rounded-os border border-ink px-3 py-1 hover:bg-ink/10"
        >
          Thử lại
        </button>
      </div>
    );
  }
}
