<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

<H1 align="center">NestJS Application with Docker</H1>
<h3 align="center">This repository contains a NestJS application Dockerized for easy deployment.</h3>
<p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
<a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
<a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
<a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
<hr>

# Task
1. Build an API endpoint that accepts a long URL as its input and ultimately returns a short
   URL that when accessed will redirect the user to the original long URL
2. When the short URL is accessed you should store statistics about its use against the
   original URL. Think of this as a scoreboard for all of the short URLs, how many times are
   they accessed, where are they accessed from, by what unique users
3. Build an API endpoint that will return the URLs and their stored statics. Just imagine we
   have a UI that will present a list of URLs alongside its statistics like a scoreboard
4. Provide API documentation that conforms to the OpenAPI standard
5. Dockerize the project

### Bonus
If you have time, implement an API endpoint that allows a user to modify their short urls.
1. The ability to set an alias for the auto generated short url e.g. shorturl.com/123456789 >
   shorturl.com/myshorturl
2. The ability to add a request limit to the URL, perhaps you only want the first 10 people to
   who request the short URL to be redirected to the original url
3. The ability to delete a short url. Think about the best way to let users know that a
   shortURL they are accessing has actually been deleted

### Extra bonus
Think about concurrency and API performance. What happens if the API is receiving thousands
of requests per second? How can you enforce data integrity and ensure that the API is
responding promptly to its users?

<hr>

# How to run the app 

### Prerequisites

Before you begin, ensure you have Docker installed on your machine. You can download and install Docker from [the official Docker website](https://www.docker.com/products/docker-desktop).

## Getting Started

1. Clone this repository to your local machine:

   ```bash
   git clone https://github.com/ahmadaltaib/url-shorter

2. Navigate to the project directory:
    ```bash
    cd url-shorter

3. Build the Docker image:
    ```bash
   docker build -t url-shorter-app .

4. Run the Docker container:
    ```bash
    docker run -d -p 3000:3000 nestjs-app

5. Access your NestJS application:

    Open your web browser and navigate to http://localhost:3000/api to see the Swagger UI

    ### Development
    
    ```bash
    # development
    $ npm run start
    
    # watch mode
    $ npm run start:dev
    
    ```
    
    ### Test
    
    ```bash
    # unit tests
    $ npm run test
    
    # e2e tests
    $ npm run test:e2e
    
    # test coverage
    $ npm run test:cov
    ```

## License

Nest is [MIT licensed](LICENSE).
