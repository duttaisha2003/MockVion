import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";

const embeddings = new HuggingFaceInferenceEmbeddings({
  apiKey: process.env.HUGGINGFACEHUB_API_KEY,
  model: "sentence-transformers/all-MiniLM-L6-v2",
});

export async function storeJobInPinecone(job) {
  try {
    const pinecone = new PineconeClient({
      apiKey: process.env.PINECONE_API_KEY,
    });

    const index = pinecone.Index("mockvion");
    const namespace = "jobs";

    const content = `
      Job Title: ${job.title}
      Description: ${job.description}
      Skills: ${(job.skillsRequired || []).join(", ")}
      Experience: ${job.experienceRequired?.min || 0} to ${job.experienceRequired?.max || "any"}
    `;

    //  Create embedding
    const vector = await embeddings.embedQuery(content);

    const id = job.jobId;

    await index.namespace(namespace).upsert([
      {
        id,
        values: vector,
        metadata: {
          type: "job",
          jobId: job.jobId,
          title: job.title,
          skills: job.skillsRequired || [],
        },
      },
    ]);

    console.log(`Stored job: ${job.jobId}`);

  } catch (error) {
    console.error("Job Pinecone Error:", error);
  }
}

export const deleteJobFromPinecone = async (jobId) => {
  try {
    const pinecone = new PineconeClient({
      apiKey: process.env.PINECONE_API_KEY,
    });

    const index = pinecone.Index("mockvion"); 
    const namespace = "jobs";                 

    await index.namespace(namespace).deleteOne(jobId); 

    console.log(`Deleted job ${jobId} from Pinecone`);
  } catch (error) {
    console.error("PINECONE DELETE ERROR:", error);
    throw error; 
  }
};