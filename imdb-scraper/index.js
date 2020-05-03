const express = require('express');
const cors = require('cors');
const movie_scraping = require('./movie_scraping')

const app = express();

app.use(cors());

app.get('/',(req,res)=>{
    res.json({
        message : 'I love Scraping'
    });
});

app.get('/search/:title',(req,res)=>{
    movie_scraping.searchMovies(req.params.title)
    .then(movies => {
        res.json(movies);
    });
});

app.get('/movie/:imdbID',(req,res)=>{
    movie_scraping.getMovie(req.params.imdbID)
    .then(movie => {
        res.json(movie);
    });
});



const port = process.env.PORT || 3000;
app.listen(port, ()=>{
    console.log(`Listening on ${port}`);
});