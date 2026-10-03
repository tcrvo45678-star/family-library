declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    BOOK_COVERS: R2Bucket;
    GEMINI_API_KEY: string;
  }
}
