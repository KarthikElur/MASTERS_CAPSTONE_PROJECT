This project proposes a scalable and interactive AQI prediction system that integrates modern frontend and backend frameworks with cloud deployment and machine learning. The frontend utilizes React with Leaflet for OpenStreetMap interaction and Firebase for Google Authentication. Predictions are rendered via Nivo graphs and histograms, connected to specific AQ sensor locations. The FastAPI backend, hosted by using Docker on AWS, serves ML inference through RESTful APIs, leveraging models such as Random Forest and Neural Networks. To handle CORS and XSS issues, a Cloudflare Worker is implemented as a proxy layer for secure front-end-backend communication.



Keywords—Air Quality Index, Machine Learning, Cloudflare Workers, FastAPI, React, Leaflet, Firebase, Docker

Link of the website: sensormetrics.pages.dev


![image](https://github.com/user-attachments/assets/5ae58a4e-d0fb-4504-b427-297146469c59)

