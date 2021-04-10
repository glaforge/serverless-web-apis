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
export REGION_FIRESTORE=europe-west2
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
gcloud app create --region=${REGION_FIRESTORE}
gcloud firestore databases create --region=${REGION_FIRESTORE}
```

Deploy the function:
```bash

```

Testing function locally:
```bash
npm install @google-cloud/functions-framework

npx @google-cloud/functions-framework --target=parseBooks

curl -d "@../data/books.json" -H "Content-Type: application/json" http://localhost:8080/
```