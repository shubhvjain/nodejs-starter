### Boilerplate  REST API with user management using NodeJS and MongoDB
----

#### List of environment variables required

To connect to MongoDB server
- `DB_URL` : MongoDB server url. E.g. `mongodb://127.0.0.1:27017`
- `DB_NAME` : Name of database to use in MongoDB

To send emails
- `ADMIN_EMAIL` : Provide email of admin to send server emails like backup etc..
- `EMAIL_HOST` :  Host of email provider
- `EMAIL_PORT` :  Port of email provider
- `EMAIL_USER` :  Username of email provider
- `EMAIL_PWD` :   Email password
- `EMAIL_SERVICE` : Email service (must be a well known [Nodemailer service](https://nodemailer.com/smtp/well-known/))
