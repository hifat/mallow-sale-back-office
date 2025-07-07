[GET] /recipes

response:
```
{
  "items": [
    {
      "createdAt": "string",
      "id": "string",
      "ingredients": [
        {
          "inventory": {
            "createdAt": "string",
            "id": "string",
            "name": "string",
            "purchasePrice": 0,
            "purchaseQuantity": 0,
            "purchaseUnit": {
              "code": "string",
              "name": "string"
            },
            "remark": "string",
            "updatedAt": "string",
            "yieldPercentage": 0
          },
          "quantity": 0,
          "unit": "string"
        }
      ],
      "name": "string",
      "updatedAt": "string"
    }
  ],
  "meta": {
    "total": 0
  }
}
```

[POST] /recipes

body:
```
{
  "ingredients": [
    {
      "inventoryID": "string",
      "quantity": 0,
      "unit": {
        "code": "string"
      }
    }
  ],
  "name": "string"
}
```

[GET] /recipes/{id}

response:
```
{
  "item": {
    "createdAt": "string",
    "id": "string",
    "ingredients": [
      {
        "inventory": {
          "createdAt": "string",
          "id": "string",
          "name": "string",
          "purchasePrice": 0,
          "purchaseQuantity": 0,
          "purchaseUnit": {
            "code": "string",
            "name": "string"
          },
          "remark": "string",
          "updatedAt": "string",
          "yieldPercentage": 0
        },
        "quantity": 0,
        "unit": "string"
      }
    ],
    "name": "string",
    "updatedAt": "string"
  }
}
```

[PUT] /recipes/{id}

body:
```
{
  "ingredients": [
    {
      "inventoryID": "string",
      "quantity": 0,
      "unit": {
        "code": "string"
      }
    }
  ],
  "name": "string"
}
```