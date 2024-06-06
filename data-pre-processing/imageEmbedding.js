async function processImage(url) {
  const { AutoProcessor, CLIPVisionModelWithProjection, RawImage } =
    await import("@xenova/transformers");
  // Load processor and vision model
  const processor = await AutoProcessor.from_pretrained(
    "Xenova/clip-vit-base-patch16"
  );
  const vision_model = await CLIPVisionModelWithProjection.from_pretrained(
    "Xenova/clip-vit-base-patch16"
  );

  // Read image and run processor
  const image = await RawImage.read(url);
  const image_inputs = await processor(image);

  // Compute embeddings
  const { image_embeds } = await vision_model(image_inputs);
  return image_embeds.data;
}

async function processImages(data) {
  const { AutoProcessor, CLIPVisionModelWithProjection, RawImage } =
    await import("@xenova/transformers");
  // Load processor and vision model
  const processor = await AutoProcessor.from_pretrained(
    "Xenova/clip-vit-base-patch16"
  );
  const vision_model = await CLIPVisionModelWithProjection.from_pretrained(
    "Xenova/clip-vit-base-patch16"
  );

  let count = 0;
  let lastPrintedPercent = 0;
  for (const item of data) {
    count++;
    let image = null;
    try {
      image = await RawImage.read(item.filePath);
    } catch (error) {
      console.error(`Error reading image from ${item.filePath}: ${error}`);
      continue;
    }
    const image_inputs = await processor(image);
    const { image_embeds } = await vision_model(image_inputs);
    item.embeddings = Array.from(image_embeds.data);
    const progressPercent = Math.floor((count / data.length) * 100);
    if (progressPercent >= lastPrintedPercent + 1) {
      console.log(`Progress: ${progressPercent}%`);
      lastPrintedPercent = progressPercent;
    }
  }
}

async function processString(string) {
  const { AutoTokenizer, CLIPTextModelWithProjection } = await import(
    "@xenova/transformers"
  );

  const processor = await AutoTokenizer.from_pretrained(
    "Xenova/clip-vit-base-patch16"
  );
  const text_model = await CLIPTextModelWithProjection.from_pretrained(
    "Xenova/clip-vit-base-patch16"
  );

  // Read image and run processor
  const texts = [string];
  const text_inputs = await processor(texts, {
    padding: true,
    truncation: true,
  });

  // Compute embeddings
  const { text_embeds } = await text_model(text_inputs);
  return text_embeds;
}

function cosineSimilarity(A, B) {
  if (A.length !== B.length) throw new Error("A.length !== B.length");
  let dotProduct = 0,
    mA = 0,
    mB = 0;
  for (let i = 0; i < A.length; i++) {
    dotProduct += A[i] * B[i];
    mA += A[i] * A[i];
    mB += B[i] * B[i];
  }
  mA = Math.sqrt(mA);
  mB = Math.sqrt(mB);
  let similarity = dotProduct / (mA * mB);
  return similarity;
}

async function search(query, images) {
  const queryEmbeddings = await processString(query);
  let results = [];
  images.forEach((item) => {
    const similarity = cosineSimilarity(queryEmbeddings.data, item.embeddings);
    results.push({ filePath: item.filePath, similarity: similarity });
  });
  results.sort((a, b) => b.similarity - a.similarity);
  return results;
}

const fs = require("fs");
const path = require("path");

async function processAndWriteData(data, batchNum) {
  let start2 = Date.now();
  await processImages(data);
  console.log(
    `Time taken for processing all images batch: ${Date.now() - start2}ms`
  );

  fs.writeFileSync(
    path.resolve(__dirname, `output/dataEmbeddedBatch_${batchNum}.json`),
    JSON.stringify(data)
  );
}
function updateFinalJsonFile(batch) {
  const dataFile = path.resolve(__dirname, "dataEmbedded.json");
  let existingData = [];
  if (fs.existsSync(dataFile)) {
    existingData = JSON.parse(fs.readFileSync(dataFile));
  }
  existingData.push(...batch);
  fs.writeFileSync(dataFile, JSON.stringify(existingData));
}

async function processBatches(data, batchSize) {
  let start = 0;
  let end = batchSize;
  let totalBatches = Math.ceil(data.length / batchSize);
  let totalStart = Date.now();
  let lastCheckpoint = null;

  try {
    // Load previous checkpoint
    const checkpointFile = path.resolve(__dirname, "checkpoint.json");
    if (fs.existsSync(checkpointFile)) {
      lastCheckpoint = JSON.parse(fs.readFileSync(checkpointFile));
      start = lastCheckpoint.start;
      end = start + batchSize;
      totalBatches = Math.ceil((data.length - end) / batchSize);
    }
  } catch (error) {
    console.error(`Error loading checkpoint: ${error}`);
  }

  for (let i = 0; i < totalBatches; i++) {
    let batch = data.slice(start, end);
    let batchStart = Date.now();
    console.log(`Processing batch ${i + 1} of ${totalBatches}`);
    await processAndWriteData(batch, end);
    let batchEnd = Date.now();
    let batchTime = batchEnd - batchStart;
    let percentComplete = ((i + 1) / totalBatches) * 100;
    let estimatedTime = batchTime * (totalBatches - i - 1);
    console.log(
      `Batch ${
        i + 1
      } completed in ${batchTime}ms. ${percentComplete}% complete. Estimated time remaining: ${
        Math.round(estimatedTime / 6000) / 10
      } mins.`
    );
    // Update the final JSON file
    //updateFinalJsonFile(batch);
    // Save checkpoint
    fs.writeFileSync(
      path.resolve(__dirname, "checkpoint.json"),
      JSON.stringify({ start: end })
    );
    start += batchSize;
    end = start + batchSize;
  }

  let totalEnd = Date.now();
  let totalTime = totalEnd - totalStart;
  console.log(`Total time elapsed: ${totalTime}ms.`);
}
/*
// Embed for upload to Pinecone
const data = fs
  .readdirSync(path.resolve(__dirname, "streetImageDataFinal"))
  .map((item) => {
    // Example item: 167_51.04888546394331_-114.0652774598064_270.jpg
    return {
      filePath: "streetImageDataFinal/" + item,
      title: item,
      pointId: item.split("_")[0],
      lat: item.split("_")[1],
      lon: item.split("_")[2],
      heading: item.split("_")[3].replace(".jpg", ""),
    };
  });

let batchSize = 1000;
processBatches(data, batchSize);*/

/*
// Embed and search locally
const images = fs
  .readdirSync(path.resolve(__dirname, "streetImageDataFinal"))
  .map((item) => {
    // Example item: 167_51.04888546394331_-114.0652774598064_270.jpg
    return {
      filePath: "streetImageDataFinal/" + item,
      index: item.split("_")[0],
      lat: item.split("_")[1],
      lon: item.split("_")[2],
      heading: item.split("_")[3],
    };
  });

console.log(`Total images: ${images.length}`);
console.log(images);

processImages(images).then((res) => {
  //console.log(images);
  const readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  async function askForInput() {
    let term = await new Promise((resolve) =>
      readline.question("Enter search term: ", resolve)
    );
    await search(term, images).then((res) => {
      console.log(res.slice(0, 5));
    });
    askForInput(); // loop back to ask for input again
  }

  askForInput();
});

// write images objs to json
fs.writeFileSync(
  path.resolve(__dirname, "images.json"),
  JSON.stringify(images)
);*/
