const express = require('express');
const cors = require('cors');

const PORT = 3000;

const app = express();
app.use(cors());
app.use(express.urlencoded({extended:false}));
app.use(express.json());

app.get('/health',(req,res)=>{
    res.send('Healthy');
});

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
})