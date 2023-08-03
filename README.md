# Serverless Web APIs Workshop

Code for the serverless web APIs workshop

# Project structure

* `data` holds a JSON file with sample data to import (from the [100-best-books](https://github.com/benoitvallon/100-best-books/blob/master/books.json) repository)
* `function-import` contains a Cloud Functions that imports sample data
* `run-crud` is a Cloud Run service handling CRUD operations and exposes them through a REST API
* `appengine-frontend` servers a Web app to access, browse, update the data, calling the REST API

# Cloud Functions — Import bulk data

Export environment variables:
```
export REGION=europe-west3
```

Enable Cloud Functions, Cloud Build, and Cloud Firestore:
```bash
gcloud services enable cloudfunctions.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable appengine.googleapis.com
gcloud services enable firestore.googleapis.com
```

Create and prepare Cloud Firestore database:
```bash
gcloud app create --region=${REGION}
gcloud firestore databases create --location=${REGION}

gcloud firestore indexes composite create --collection-group=books \
--field-config field-path=language,order=ascending \
--field-config field-path=updated,order=descending 

gcloud firestore indexes composite create --collection-group=books \
--field-config field-path=author,order=ascending \
--field-config field-path=updated,order=descending 

```

Deploy the function:
```bash
gcloud functions deploy bulk-import \
       --gen2 \
       --trigger-http \
       --runtime=nodejs20 \
       --allow-unauthenticated \
       --region=${REGION} \
       --source=. \
       --entry-point=parseBooks
```

Testing function locally:
```bash
npm install @google-cloud/functions-framework

npx @google-cloud/functions-framework --target=parseBooks

curl -d "@../data/books.json" -H "Content-Type: application/json" http://localhost:8080/
```

# Cloud Run — CRUD operations exposed as a REST API

Setup Cloud Build and Cloud Run:
```bash
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com

gcloud config set run/platform managed
gcloud config set run/region ${REGION}
```

Run locally and send some requests:
```bash
npm start

curl -XPOST -d '{"isbn":"9782070368228","title":"Book","author":"me","pages":123,"year":2021,"language":"French"}' -H "Content-Type: application/json" http://localhost:8080/books
curl -XPOST -d '{"title":"Book","author":"me","pages":123,"year":2021,"language":"French"}' -H "Content-Type: application/json" http://localhost:8080/books/9782070368228
curl -XDELETE http://localhost:8080/books/9782070368228
curl http://localhost:8080/books/9780140449136
curl http://localhost:8080/books/9782070360536
curl -XPUT -d '{"title":"Book"}' -H "Content-Type: application/json" http://localhost:8080/books/9780003701203
curl http://localhost:8080/books
curl http://localhost:8080/books?author=Virginia+Woolf
curl http://localhost:8080/books?language=English
curl http://localhost:8080/books?page=3
```

Build locally with Docker:
```bash
docker build -t crud-web-api .
docker run --rm -p 8080:8080 -it crud-web-api
```

Build and deploy to Cloud Run:
```bash
gcloud builds submit --tag gcr.io/${GOOGLE_CLOUD_PROJECT}/crud-web-api
gcloud run deploy run-crud --image gcr.io/${GOOGLE_CLOUD_PROJECT}/crud-web-api --allow-unauthenticated --region=${REGION} --platform=managed
```

# App Engine — Web frontend

Export Cloud Run Web API service URL so it's available for running the App Engine app locally:
```bash
export RUN_CRUD_SERVICE_URL=https://run-crud-sh43zgzkgq-ew.a.run.app
```

Run the application locally:
```bash
npm start
```

Or with continuous file watching / server reloading with:
```bash
npm run dev
```

Deploy app on App, but ensure `app.yaml` is updated with Cloud Run service URL:
```bash
gcloud app deploy -q
```
