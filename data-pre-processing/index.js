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

  // Read image and run processor
  for (const item of data) {
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
    results.push({ title: item.title, similarity: similarity });
  });
  results.sort((a, b) => b.similarity - a.similarity);
  return results;
}

const fs = require("fs");
const path = require("path");

/*
const data = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "../AllPhotosData.json"))
); //.slice(1100, 1215);

data.forEach((item) => {
  item.filePath = "/Users/sunnynagam/Downloads/AllPhotos/" + item.title;
  item.filePath = item.filePath.replace(/:/g, "_");
  //console.log(item.filePath);
});
fs.writeFileSync(
  path.resolve(__dirname, "dataBefore.json"),
  JSON.stringify(data)
);*/

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

processImage("IMG_1168.JPG").then((res) => {
  console.log(res);
});
//let batchSize = 1000;
//processBatches(data, batchSize);

// start = Date.now();
// let queryEmbeddings = null;
// const string = "frowning face";
// processString(string).then((text_embeds) => {
//   queryEmbeddings = text_embeds;
//   //console.log(text_embeds);
//   console.log(`Time taken for text embedding: ${Date.now() - start}ms`);
// });

// upload images to cloud
