# Sapia Codetest

## About the project

---

This is a back-end project to meet the Login requirement on Sapia's codetest. It is built with NodeJS, TypeScript, MongoDB and Docker, alongwith a bunch of third-party libraries including Jest (for testing), Express (Web app framework), Bcrypt (for password hashing) etc.

It connects to the MongoDB and provides **User Login** and **User Register** (just for the convenience for anyone who wants to login with his/her preferred username and password) features. Main user scenarios include as follows:

- User puts the right username and password, return 'success'
- User puts the username which does NOT exist:
  - return 'failed', alongside the error message: 'username does not exist!'
- User puts the username which exsists:
  - User puts the wrong password less than 3 times under 5 min, return 'failed', alongside the error message: Password is wrong! Please try again!
  - User puts the wrong password which hits 3 times in 5 min, return 'failed', alongside the error message: You have failed to try 3 times! Account is locked!
  - When this particular user has been lock, no matter he puts the right or wrong password, return 'failed', alongside the error message: account is locked! Please try again after `X` min
- After 5min, the user should be unclocked, he/she can login again
<p align="right">(<a href="#top">back to top</a>)</p>
