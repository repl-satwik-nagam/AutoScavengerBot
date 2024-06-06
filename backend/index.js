import express from 'express';
import cors from 'cors';
import { loadModel, searchPinecone } from './embed/embed.js';
let modelProcessor, modelTextModel;
const PORT = 80;

const app = express();
app.use(cors());
app.use(express.urlencoded({extended:false}));
app.use(express.json());

app.get('/health',(req,res)=>{
    res.send('Healthy');
});

app.get('/findImageAndCoordinates',async(req, res)=>{
    const { queryString, numberOfMatches } = req.query;
    const topK = Number.parseInt(numberOfMatches) || 3;
    const apiKey = "f242dfba-6a9a-403b-8a28-50b950a5dfda";
    const output = await searchPinecone(modelProcessor, modelTextModel, queryString, topK, apiKey);
    console.log(output);
    res.send(output);
});

app.listen(PORT, async() => {
    const { processor, text_model} = await loadModel();
    modelProcessor = processor;
    modelTextModel = text_model;
    console.log(`Listening on port ${PORT}`);
});