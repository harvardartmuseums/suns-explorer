# Suns Explorer (Advanced)

## Requirements

* NodeJS    
* [Harvard Art Museums API key](http://www.harvardartmuseums.org/collections/api)  

## Setup

1. Run `npm install` to install the required packages 

2. Set environment variables  

    + Production: Create a system environment variable named `apikey` and set it to your Harvard Art Museums API key  
    + Development: Clone the .env-sample file into a new .env file and set `apikey` to your Harvard Art Museums API key

3. Run `npm start`

4. View http://localhost:3000 in your browser  


## Composition of the Universe

Each universe if situated in a spacetime continuum. The elements in a given universe are ordered hierarchically.

* Spacetime  
    * Universe  
        * System
            * Entity
                * Orbit
                * Planet
            * Text

A system represents an object. An entity represents a color. An entity is composed of an orbit and a planet. The planet follows the orbit. 