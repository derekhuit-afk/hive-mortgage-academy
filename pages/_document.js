import Document, { Html, Head, Main, NextScript } from 'next/document';

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head />
        <body>
          <Main />
          <NextScript />
          {/* Huit.AI Autonomous Sales Engine */}
          <script src="https://ase.huit.ai/widget.js" data-product="DEFAULT" defer></script>
        </body>
      </Html>
    );
  }
}
