## <ins> **TinyApp Project** </ins>

##### TinyApp is a Web Application built on Node and Express which takes a regular URL and transforms it into an encoded version, which redirects back to the original URL!

----------
 ### <ins>  **Dependencies** </ins>


 > - Web Server: Node.js 
 > - Middleware: Express
  > - Template Engine: EJS


 ---------------
### <ins>  **Getting started** </ins>
- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` OR `npm start` command.
- Regsiter to the app using an email and password
------------------
### <ins>  **User Specific Functionalities** </ins>
- Create new Short URLs
- Edit your saved URLs 
- Delete saved URLs
-----------------
 ### <ins>  **Features** </ins>

1. Secure User Registration and Login
 - This app allows people to register for a user account with an email and password 

 2. Hashed password bcryptjs node package
 - the registration endpoint useS bcrypt to hash and save password 

3. Encrypted Cookies using cookie-session Middleware

- we encrypt the value (using the AES cipher, and some secret key), and set the result (called the "digest") as the cookie.

4. URL Shortening
 - Fully functional web service API to shorten URLs
 - shortened URLs are saved for future use 

5. Permission based features 
 - Only registered users have access to their own saved shortened URLS
 - Anyone can visit short URLs
-------------








