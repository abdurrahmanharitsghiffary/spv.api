# AUTH (PUBLIC)

- REGISTER ACCOUNT
  POST /api/auth/signup fields: {username , password, email}

- LOGIN
  POST /api/auth/signin fields: {email, password}

# USER

Required: headers >> Authorization <<
Example {
headers:{
"Authorization":"Bearer <Access_token>"
}
}

- GET USER BY ID (PUBLIC & AUTH)
  GET /api/user/:userId

- GET ALL USER (ADMIN)
  GET /api/user

- UPDATE USER BY ID (ADMIN) fields: { username, image, description }
  PATCH /api/user/:userId

- DELETE USER BY ID (ADMIN)
  DELETE /api/user/:userId

---

# ACCOUNT (AUTH)

Required: headers >> Authorization <<
Example {
headers:{
"Authorization":"Bearer <Access_token>"
}
}

- GET CURRENT LOGGED ACCOUNT INFO
- DELETE CURRENT LOGGED ACCOUNT
- UPDATE CURRENT LOGGED ACCOUNT INFO FIELDS : { description, username, email, image }
  GET, DELETE, PATCH /api/account/me

// COMMENT

// FOLLOW

// POST

// REACTION POST
