import {
    AutoTokenizer,
    CLIPTextModelWithProjection,
    env as transformersEnv,
  } from "@xenova/transformers";

export async function loadModel() {
    const processor = await AutoTokenizer.from_pretrained(
        "Xenova/clip-vit-base-patch16"
    );

    const text_model = await CLIPTextModelWithProjection.from_pretrained(
        "Xenova/clip-vit-base-patch16"
    );
    return { processor, text_model };
}

export async function processString(processor, text_model, string) {
    console.log("Processing string: ", string);

    const texts = [string];
    const text_inputs = await processor(texts, {
        padding: true,
        truncation: true,
    });

    const { text_embeds } = await text_model(text_inputs);
    return text_embeds.data;
}

export async function searchPinecone(processor, text_model, query, topK, apiKey) {
    const pc = new Pinecone({ apiKey: apiKey });
    const embeddings = await processString(processor, text_model, query);
    console.log("Embeddings: ", embeddings);

    const index = pc.index("photo-search");
    console.log("Filter: ", filter.value);
    const results = await index.query({
        vector: Array.from(embeddings),
        topK: Number(topK),
        includeValues: false,
        filter: filter.value,
    });
    return results;
}

