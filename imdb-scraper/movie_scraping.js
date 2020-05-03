const fetch = require('node-fetch');
const cheerio = require('cheerio');

const searchUrl = 'https://www.imdb.com/find?s=tt&ttype=ft&ref_=fn_ft&q=';
const movieUrl = "https://www.imdb.com/title/";

const searchCache = {};
const movieCache = {};


function searchMovies(searchTerm){
    if(searchCache[searchTerm])
    {
        console.log('Serving from cache',searchTerm);
        return Promise.resolve(searchCache[searchTerm]);
    }



    return fetch(`${searchUrl}${searchTerm}`)
    .then(response => response.text())
    .then(body =>{
        const movies = []
        const $ = cheerio.load(body);
        $('.findResult').each(function(i,element){
            const $element =$(element);
            const $image = $element.find('td a img');
            const $title = $element.find('td.result_text a');
            
            const imdbID = $title.attr('href').match(/title\/(.*)\//)[1];

            const movie = {
                image : $image.attr('src'),
                title : $title.text()
                ,imdbID
            };
            movies.push(movie);
        });

        searchCache[searchTerm] = movies;

        return movies;
    });
}

function getMovie(imdbID) {

    if(movieCache[imdbID]){
        console.log('Serving from cache',imdbID);
        return Promise.resolve(movieCache[imdbID]);
    }


    return fetch(`${movieUrl}${imdbID}`)
    .then(response => response.text())
    .then(body => {
        const $ = cheerio.load(body);
        const $title = $('.title_wrapper h1'); 
        const title = $title.first().contents().filter(function(){
            return this.type === 'text';
        }).text().trim();
        const rating = $('.subtext').contents().not($('*')).text().replace(/(\r\n|\n|\r|,)/gm," ").trim();

        const runTime = $('time').first().contents().filter(function(){
            return this.type === 'text';
        }).text().trim();


        var genre = $('.subtext a').text();
        var ind = genre.indexOf(' ');
        var ind2 = genre.indexOf('(');
        const genres = genre.substr(0,ind-1);
        const datePublished = genre.substring(ind-1,ind2-1);
        const imdbRating = $('span[itemProp="ratingValue"]').text();
        const poster = $('div.poster a img').attr('src');
        const summary = $('div.summary_text').text().trim();
        const trailer =  $('.slate a').attr('href');

        const movie =  {
                title,
                rating,
                runTime,
                genres,
                datePublished,
                imdbRating,
                poster,
                summary,
                trailer:`https://www.imdb.com/${trailer}`
            };

            movieCache[imdbID] = movie;
        return movie;
    });
}

module.exports = {
    searchMovies,
    getMovie
}   
    