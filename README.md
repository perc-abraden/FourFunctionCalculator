# FourFunctionCalculator

A local ASP.NET Core REST API for a four-function calculator.

## Angular Frontend

An Angular UI is available in `calculator-ui/` and calls the API endpoints defined in the OpenAPI spec.

Run the frontend from `calculator-ui` with `npm start`.

The UI defaults to API base URL `http://localhost:5050` and can be changed in the form.

## Run

Run `dotnet run` from this project folder.

The API is configured to run at `http://localhost:5050` by default.
Keep this process running while using the Angular UI.

## Endpoints

- `GET /health`
- `GET /api/calculator/add?a=10&b=5`
- `GET /api/calculator/subtract?a=10&b=5`
- `GET /api/calculator/multiply?a=10&b=5`
- `GET /api/calculator/divide?a=10&b=5`

Root endpoint:

- `GET /` returns a welcome message and example routes.
- Angular UI health indicator checks `GET /health`.

## OpenAPI Specification

This project includes API specification files in both formats:

- `openapi.yaml`
- `openapi.json`

You can import either file into API tools such as Postman or Insomnia.

### Import into Postman

1. Open Postman.
2. Select **Import**.
3. Choose `openapi.yaml` or `openapi.json` from this folder.

### Import into Insomnia

1. Open Insomnia.
2. Create or select a project.
3. Use **Import/Export** → **Import Data**.
4. Select `openapi.yaml` or `openapi.json`.

## Build

Run `dotnet build` from this project folder.

Run `npm run build` from `calculator-ui` to build the frontend.
