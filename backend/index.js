import express from 'express';
import cors from 'cors';
import { loadModel, processString } from './embed/embed.js';
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
    const { queryString } = req.query;
    const embedding = await processString(modelProcessor, modelTextModel,queryString);
    console.log(embedding);
    res.send(embedding);
});

app.listen(PORT, async() => {
    const { processor, text_model} = await loadModel();
    modelProcessor = processor;
    modelTextModel = text_model;
    console.log(`Listening on port ${PORT}`);
})