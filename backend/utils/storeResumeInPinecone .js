import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";

const embeddings = new HuggingFaceInferenceEmbeddings({
  apiKey: process.env.HUGGINGFACEHUB_API_KEY,
  model: "sentence-transformers/all-MiniLM-L6-v2",
});

export async function storeResumeInPinecone(resume) {
  try {
    const pinecone = new PineconeClient({
      apiKey: process.env.PINECONE_API_KEY,
    });

    const index = pinecone.Index("mockvion");

    const namespace = "resumes";

    const content = `
      Name: ${resume.name || ""}
      Skills: ${(resume.skills || []).join(", ")}
      Projects: ${(resume.projects || []).join(", ")}
      Experience: ${resume.experience || ""}
    `;

    //  Create embedding
    const vector = await embeddings.embedQuery(content);

    //  Single ID 
    const id = resume._id.toString();  //  match Mongo _id

    //  UPSERT ONE VECTOR
    await index.namespace(namespace).upsert([
      {
        id,
        values: vector,
        metadata: {
          type: "resume",
          userId: resume.user.toString(),
          name: resume.name || "",
          skills: resume.skills || [],
          source: "resume_upload",
        },
      },
    ]);

    console.log(`Stored resume vector for ${resume.user}`);

  } catch (error) {
    console.error("Resume Pinecone Error:", error);
  }
}