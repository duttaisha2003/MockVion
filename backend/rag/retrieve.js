
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";

const embeddings = new HuggingFaceInferenceEmbeddings({
  apiKey: process.env.HUGGINGFACEHUB_API_KEY,
  model: "sentence-transformers/all-MiniLM-L6-v2",
});

export async function retrieveSubjectChunks(subject, query) {

  const pinecone = new PineconeClient({
    apiKey: process.env.PINECONE_API_KEY,
  });

  const index = pinecone.Index("mockvion");

  const vectorStore = await PineconeStore.fromExistingIndex(
    embeddings,
    {
      pineconeIndex: index,
      namespace: subject,
    }
  );

  const results = await vectorStore.similaritySearch(query, 5);

  return results.map(doc => doc.pageContent).join("\n\n");
}