import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="theme-color" content="#1B6EF3" />
        <meta name="description" content="Shared availability calendar for finding free trip windows" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <title>Holiday Calendar</title>
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: `body{margin:0;font-family:system-ui,-apple-system,sans-serif}#root{display:flex;flex:1;min-height:100vh}` }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
