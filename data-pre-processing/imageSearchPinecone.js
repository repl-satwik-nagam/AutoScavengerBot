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

const fs = require("fs");
const path = require("path");

const getPhotosClientSide = async (string, topK = 5) => {
  const results = await searchPinecone(string, topK);
  console.log("Results: ", results);
  const photos = results.matches.map((match) => ({
    local_url: __dirname + "/streetImageDataFinal/" + match.id,
    metadata: match.metadata,
    title: `${match.id} (${Math.round(match.score * 100000) / 100000})`,
  }));
  return photos;
};
async function searchPinecone(query, topK = 5) {
  const pc = new Pinecone({ apiKey: "api_key_here" });
  const embeddings = await processString(query, topK);
  console.log("Embeddings: ", embeddings);

  const index = pc.index("calgary-street-view");
  const results = await index.query({
    vector: Array.from(embeddings.data),
    topK: Number(topK),
    includeValues: false,
    includeMetadata: true,
  });
  return results;
}

// search pinecone
const { Pinecone } = require("@pinecone-database/pinecone");
const base64Img = require("base64-img");

const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function askForInput() {
  let term = await new Promise((resolve) =>
    readline.question("Enter search term: ", resolve)
  );
  await getPhotosClientSide(term, 10).then((res) => {
    console.log(res);

    // Function to generate the HTML content
    function generateHtml(images) {
      let markersScript = "";
      images.forEach((image) => {
        const img = fs.readFileSync(image.local_url);
        const imgB64 = img.toString("base64");
        const iconId = `icon${image.metadata.latitude
          .toString()
          .replace(".", "")
          .replace("-", "")}${image.metadata.longitude
          .toString()
          .replace(".", "")
          .replace("-", "")}${image.metadata.heading}`;
        markersScript += `
                const ${iconId} = L.divIcon({
                    html: '<img src="data:image/png;base64,${imgB64}" style="width: 50px; height: 50px;" onclick="enlargeImage(this)" onmouseover="enlargeImage(this)" onmouseout="enlargeImage(this)">',
                    className: '',
                    iconSize: [50, 50]
                });
                L.marker([${image.metadata.latitude}, ${image.metadata.longitude}], { icon: ${iconId} }).addTo(map);
            `;
      });

      return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Map with Images</title>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
            <style>
                #map {
                    height: 1000px;
                }
                .enlarged {
                    width: 600px !important;
                    height: 600px !important;
                    z-index: 1000;
                    position: absolute;
                }
            </style>
        </head>
        <body>
            <div id="map"></div>
            <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
            <script>
                const map = L.map('map').setView([51.043, -114.060], 15);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors'
                }).addTo(map);
    
                ${markersScript}

                function enlargeImage(img) {
                    if (img.classList.contains('enlarged')) {
                        img.classList.remove('enlarged');
                    } else {
                        img.classList.add('enlarged');
                    }
                }
            </script>
        </body>
        </html>
        `;
    }

    // Generate the HTML file
    const htmlContent = generateHtml(res);
    fs.writeFileSync("map.html", htmlContent, "utf8");
    console.log("map.html has been created");
  });
  askForInput(); // loop back to ask for input again
}

askForInput();
