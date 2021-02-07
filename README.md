# Adidas Technical Challenge - Subscription System
This is the solution for the Adidas NodeJS Backend challenge.
# Content

 1. [Requirements](#requirements)
 2. [Build and run](Build%20and%20run)
 3. [Test](#test)
 4. [Use](#use)
	 4.1. [Swagger](#swagger)
 5. [Libraries](#libraries)

# Requirements
We need to create a newsletter subscription system with the following architecture of microservices:
 - **Public Service:** Public network. Backend for Frontend microservice to be used by UI frontend.
 - **Subscription Service:** Private network. Microservice implementing business subscription logic, including persistence of subscrition data in database and email notification to confirm process is completed.
 - **Email Service:**  Private network. Microservice implementing email notifications. No real email process, it's a Mock interface.

**Subscription System** should provide these operations:

 - **Create** new subscription
 - **Cancel** existing subscription
 - **Get details** of a subscription
 - **Get all** subscriptions

Subscriptions should contain the following **information**:

 - Email
 - First name (optional)
 - Gender (optional)
 - Date of birth
 - Flag for consent
 - Newsletter id corresponding to the campaign

All services should receive the same parameters. Non-public services must be secure.

# Build and run
This is a NodeJS application that can be run both locally or via Docker containers.

 - **NodeJS version:** v14.15.4
 - **Docker-compose version**: v3.0

After downloading the repository, on its root directory:

    $ sudo docker-compose up

Or if we want to run the application in detached mode:

    $ sudo docker-compose up -d

This automatically **builds** the images for each service and starts **running** each container. Default configuration is as follows:

 - Email service:
	 - Hostname: email-service
	 - Port: 8082
 - Subscription service: 
	 - Hostname: subscription-service
	 - Port: 8081
 - Public service:
	 - Hostname: public-service
	 - Port: 8080

If we are running the containers in detached mode and we want to stop them:

    $ sudo docker-compose down

# Tests
Tests are provided for **subscription-service**, which is the service containing business subscription logic. 

First we must install the service dependencies. On subscription-service directory:

    $ npm install

Once everything is installed, we can run the tests with the following command:

    $ npm test

# Use
Non-public services cannot be accessed without a valid token. All communication should be done through Public Service.

Public Service is an API that offers all the Subscription System operations. We can access these operations by HTTP requests as follows:

 - **```GET /subscriptions```**: Returns a list of all existing subscriptions.
 - **```GET /subscriptions/{subscriptionId}```**: Returns the requested subscription if it exists.
 - **```POST /subscriptions```**: Creates a new subscription.
 - **```DELETE /subscriptions/{subscriptionId}```**: Cancels an existing subscription.

# API Documentation
Each service has its own **Swagger UI**, which provides API documentation as well as examples and direct request access. Swagger UI for each service can be found on the path:

 - **```{SERVICE_URL}/api-docs```**

For example, we can access http://localhost:8080/api-docs once the containers are up and running to visualize *public-service* Swagger documentation. 

# Libraries
The following libraries have been used:

 - **[express](https://www.npmjs.com/package/express)**: Framework for API development
 - **[express-validator](https://www.npmjs.com/package/express-validator)**: Express middleware to validate and sanitize received input
 - **[request](https://www.npmjs.com/package/request)**: HTTP Client
 - **[nedb](https://www.npmjs.com/package/nedb)**: Embedded persistent or in memory database. In this case, it is file persistent and used to store all subscription-related data. Chosen because of its similarities with MongoDB.
 - **[njwt](https://www.npmjs.com/package/njwt)**: JWT library to create and validate JWT tokens.
 - **[async](https://www.npmjs.com/package/async)**: Utility library for asynchronous code.
 - **[swagger-ui-express](https://www.npmjs.com/package/swagger-ui-express)**: Swagger UI for express APIs based on swagger.yml or swagger.json files.
 - **[yamljs](https://www.npmjs.com/package/yamljs)**: YAML parser and encoder. In this cased, it is used for swagger.yml file.
 - **[mocha](https://www.npmjs.com/package/mocha)**: Test framework for NodeJS.
 - **[chai](https://www.npmjs.com/package/chai)**: Assertion library used for unit testing.
 - **[chai-http](https://www.npmjs.com/package/chai-http)**: HTTP integration used for API request testing.