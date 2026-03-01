
import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";

//  check
console.log("HF key exists:", !!process.env.HUGGINGFACEHUB_API_KEY);
console.log("PINECONE_API_KEY exists:", !!process.env.PINECONE_API_KEY);

const embeddings = new HuggingFaceInferenceEmbeddings({
  apiKey: process.env.HUGGINGFACEHUB_API_KEY,
  model: "sentence-transformers/all-MiniLM-L6-v2",
});


function parseMarkdownSections(content) {
  const sections = [];

  const regex =
    /\[Difficulty:\s*(.*?)\]\s*\n\[Topic:\s*(.*?)\]\s*\n\[Type:\s*(.*?)\]\s*\n([\s\S]*?)(?=\n\[Difficulty:|$)/g;

  let match;

  while ((match = regex.exec(content)) !== null) {
    sections.push({
      difficulty: match[1].trim().toLowerCase(),
      topic: match[2].trim().toLowerCase(),
      type: match[3].trim().toLowerCase(),
      text: match[4].trim(),
    });
  }

  return sections;
}

export async function loadMarkdown(subject) {
  const pinecone = new PineconeClient({
    apiKey: process.env.PINECONE_API_KEY,
  });

  const pineconeIndex = pinecone.Index("mockvion");

  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
    namespace: subject,
  });

  const filePath = path.join(
    process.cwd(),
    "knowledgeBase",
    `${subject}_kb.md`
  );

  if (!fs.existsSync(filePath)) {
    throw new Error(`Knowledge base not found for ${subject}`);
  }

  const content = fs.readFileSync(filePath, "utf-8");


  const sections = parseMarkdownSections(content);

  if (sections.length === 0) {
    throw new Error("No structured metadata sections found in markdown.");
  }

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 700,
    chunkOverlap: 100,
  });

  const documents = [];

  for (const section of sections) {
    const chunks = await splitter.splitText(section.text);

    chunks.forEach((chunk, index) => {
      documents.push({
        pageContent: chunk,
        metadata: {
          subject: subject.toLowerCase(),
          difficulty: section.difficulty,
          topic: section.topic,
          type: section.type,
          chunkIndex: index,
          source: `${subject}_kb.md`,
        },
      });
    });
  }

  const stats = await pineconeIndex.describeIndexStats();

  //  If namespace exists and you want fresh metadata, delete first
  if (stats.namespaces?.[subject]?.vectorCount > 0) {
    console.log(`Namespace "${subject}" exists. Clearing old vectors...`);
    await pineconeIndex.deleteAll({ namespace: subject });
  }

  await vectorStore.addDocuments(documents);

  console.log(
    `Stored ${documents.length} structured chunks in Pinecone under namespace "${subject}"`
  );
}