export interface QdrantConfig {
  mcpUrl: string;
  authToken?: string;
  qdrantUrl: string;
  apiKey?: string;
  collectionName: string;
  embeddingModel?: string;
}
