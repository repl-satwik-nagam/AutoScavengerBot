const fs = require("fs");
const path = require("path");
const { Pinecone } = require("@pinecone-database/pinecone"); // Ensure you have installed pinecone-client

// Configure Pinecone client
const apiKey = "api_key_here"; // Replace with your actual Pinecone API key
const pinecone = new Pinecone({ apiKey });
const index = pinecone.Index("calgary-street-view"); // Replace with your actual index name

let data = [];
for (let i = 1; i <= 25; i++) {
  const dataFile = path.resolve(
    __dirname,
    `output/dataEmbeddedBatch_${i}000.json`
  );
  try {
    const dataBatch = JSON.parse(fs.readFileSync(dataFile, "utf8"));
    data = [...data, ...dataBatch];
  } catch (error) {
    if (error.code === "ENOENT") {
      console.error(`File not found: ${dataFile}`);
      break;
    } else {
      throw error;
    }
  }
}

console.log(`Loaded ${data.length} images`);

// Function to upsert data to Pinecone
async function upsertData() {
  let chunkSize = 100;
  let totalChunks = Math.ceil(data.length / chunkSize);
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    const vectors = chunk
      .map((item) => {
        if (!item.embeddings) return null;
        return {
          id: item.title,
          values: item.embeddings,
          metadata: {
            latitude: item.lat,
            longitude: item.lon,
            heading: item.heading,
            pointId: item.pointId,
          },
        };
      })
      .filter(Boolean);

    try {
      await index.upsert(vectors);
      console.log(
        `Chunk of ${chunkSize} data upserted successfully. Progress: ${
          ((i + chunkSize) / data.length) * 100
        }%`
      );
    } catch (error) {
      console.error("Error upserting data:", error);
    }
  }
  console.log("All data upserted successfully");
}

upsertData();
